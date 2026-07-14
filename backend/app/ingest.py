"""Idempotent ingestion: turn an extracted ``LabReport`` into stored measurements.

This is the deterministic glue that makes AT-3's "no duplicates" true:
  * A file hash on ``reports`` short-circuits a re-upload of the exact same file.
  * Measurements are de-duplicated by (profile_id, marker_id, date).

Raw marker names are normalized to canonical ids via the curated catalog; anything
we do not recognize is dropped (the demo is scoped to known markers).
"""

from __future__ import annotations

import hashlib

from pydantic import BaseModel
from sqlmodel import Session, select

from app.data.markers_catalog import get_marker, normalize_marker_name
from app.extraction.schema import LabReport
from app.models.domain import Measurement, Report


class IngestResult(BaseModel):
    report_id: int | None
    duplicate_file: bool
    measurements_added: int
    measurements_deduped: int
    unrecognized: list[str]


def compute_file_hash(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()


def persist_report(
    session: Session, profile_id: int, file_hash: str, report: LabReport
) -> IngestResult:
    """Persist an extracted report idempotently. Caller commits nothing else."""
    existing = session.exec(
        select(Report).where(Report.profile_id == profile_id, Report.file_hash == file_hash)
    ).first()
    if existing is not None:
        return IngestResult(
            report_id=existing.id,
            duplicate_file=True,
            measurements_added=0,
            measurements_deduped=0,
            unrecognized=[],
        )

    db_report = Report(
        profile_id=profile_id,
        source="upload",
        report_date=report.report_date,
        file_hash=file_hash,
    )
    session.add(db_report)
    session.commit()
    session.refresh(db_report)

    added = 0
    deduped = 0
    unrecognized: list[str] = []

    for item in report.measurements:
        marker_id = normalize_marker_name(item.marker_name)
        if marker_id is None:
            unrecognized.append(item.marker_name)
            continue

        already = session.exec(
            select(Measurement).where(
                Measurement.profile_id == profile_id,
                Measurement.marker_id == marker_id,
                Measurement.date == report.report_date,
            )
        ).first()
        if already is not None:
            deduped += 1
            continue

        unit = item.unit or get_marker(marker_id).unit
        session.add(
            Measurement(
                profile_id=profile_id,
                marker_id=marker_id,
                value=item.value,
                unit=unit,
                date=report.report_date,
                report_id=db_report.id,
            )
        )
        added += 1

    session.commit()
    return IngestResult(
        report_id=db_report.id,
        duplicate_file=False,
        measurements_added=added,
        measurements_deduped=deduped,
        unrecognized=unrecognized,
    )
