"""AT-3: uploading a report extracts markers with no typing, and re-uploading the
same report creates no duplicates.

Extraction is mocked — these tests exercise the deterministic ingestion/idempotency,
not the network call to OpenAI."""

from __future__ import annotations

from datetime import date

from sqlmodel import select

import app.api.upload as upload_module
from app.extraction.schema import ExtractedMeasurement, LabReport
from app.models.domain import Measurement
from tests.conftest import seed_catalog, seed_profile


def _fake_report() -> LabReport:
    return LabReport(
        report_date=date(2026, 6, 30),
        measurements=[
            ExtractedMeasurement(marker_name="Glucosa en ayuno", value=118, unit="mg/dL"),
            ExtractedMeasurement(marker_name="HbA1c", value=6.3, unit="%"),
            # A row we don't recognize should be dropped, not crash.
            ExtractedMeasurement(marker_name="Some Unknown Panel", value=1, unit="x"),
        ],
    )


def _install_fake_extraction(monkeypatch):
    monkeypatch.setattr(
        upload_module, "extract_lab_report", lambda *a, **k: _fake_report()
    )


def test_upload_adds_markers_without_typing(client, session, monkeypatch):
    seed_catalog(session)
    seed_profile(session)
    _install_fake_extraction(monkeypatch)

    resp = client.post("/api/upload", files={"file": ("labs.pdf", b"PDFBYTES1", "application/pdf")})
    assert resp.status_code == 200
    data = resp.json()

    assert data["duplicate_file"] is False
    assert data["measurements_added"] == 2  # two recognized markers
    assert data["unrecognized"] == ["Some Unknown Panel"]

    stored = session.exec(select(Measurement)).all()
    assert {m.marker_id for m in stored} == {"glucose_fasting", "hba1c"}


def test_same_file_reupload_creates_no_duplicates(client, session, monkeypatch):
    seed_catalog(session)
    seed_profile(session)
    _install_fake_extraction(monkeypatch)

    payload = {"file": ("labs.pdf", b"PDFBYTES1", "application/pdf")}
    client.post("/api/upload", files=payload)
    second = client.post("/api/upload", files={"file": ("labs.pdf", b"PDFBYTES1", "application/pdf")})

    assert second.json()["duplicate_file"] is True
    assert second.json()["measurements_added"] == 0
    assert len(session.exec(select(Measurement)).all()) == 2


def test_different_file_same_readings_dedupes_by_profile_marker_date(client, session, monkeypatch):
    """A different file (new hash) with the same (marker, date) must not duplicate rows."""
    seed_catalog(session)
    seed_profile(session)
    _install_fake_extraction(monkeypatch)

    client.post("/api/upload", files={"file": ("labs.pdf", b"PDFBYTES1", "application/pdf")})
    second = client.post(
        "/api/upload", files={"file": ("labs_rescanned.pdf", b"DIFFERENTBYTES2", "application/pdf")}
    )

    data = second.json()
    assert data["duplicate_file"] is False
    assert data["measurements_added"] == 0
    assert data["measurements_deduped"] == 2
    assert len(session.exec(select(Measurement)).all()) == 2
