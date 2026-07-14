"""Managing studies: a profile can list and delete its own reports, and can never
touch another profile's reports."""

from __future__ import annotations

from datetime import date

from sqlmodel import Session, select

from app.models.domain import Measurement, Profile, Report
from tests.conftest import auth_headers, seed_catalog, seed_profile


def _add_report(session: Session, profile: Profile, file_hash: str) -> Report:
    report = Report(
        profile_id=profile.id,
        source="upload",
        report_date=date(2026, 6, 30),
        file_hash=file_hash,
    )
    session.add(report)
    session.commit()
    session.refresh(report)
    session.add(
        Measurement(
            profile_id=profile.id,
            marker_id="glucose_fasting",
            value=118,
            unit="mg/dL",
            date=date(2026, 6, 30),
            report_id=report.id,
        )
    )
    session.commit()
    return report


def test_list_reports_scoped_to_profile(client, session):
    seed_catalog(session)
    rafael = seed_profile(session, name="Rafael", username="rafael")
    karla = seed_profile(session, name="Karla", username="karla")
    _add_report(session, rafael, "hash-rafael")
    _add_report(session, karla, "hash-karla")

    resp = client.get("/api/reports", headers=auth_headers(rafael))
    assert resp.status_code == 200
    reports = resp.json()
    assert len(reports) == 1
    assert reports[0]["measurement_count"] == 1


def test_delete_report_removes_measurements(client, session):
    seed_catalog(session)
    rafael = seed_profile(session, name="Rafael", username="rafael")
    report = _add_report(session, rafael, "hash-rafael")

    resp = client.delete(f"/api/report/{report.id}", headers=auth_headers(rafael))
    assert resp.status_code == 200
    assert resp.json()["measurements_deleted"] == 1

    assert session.get(Report, report.id) is None
    assert session.exec(select(Measurement)).all() == []


def test_cannot_delete_another_profiles_report(client, session):
    seed_catalog(session)
    rafael = seed_profile(session, name="Rafael", username="rafael")
    karla = seed_profile(session, name="Karla", username="karla")
    karla_report = _add_report(session, karla, "hash-karla")

    # Rafael tries to delete Karla's report.
    resp = client.delete(f"/api/report/{karla_report.id}", headers=auth_headers(rafael))
    assert resp.status_code == 404
    # Karla's report is untouched.
    assert session.get(Report, karla_report.id) is not None


def test_missing_profile_header_rejected(raw_client, session):
    seed_catalog(session)
    seed_profile(session, name="Rafael", username="rafael")
    resp = raw_client.get("/api/history")
    assert resp.status_code == 401
