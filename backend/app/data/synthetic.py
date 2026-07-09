"""Synthetic longitudinal demo data (100% fake — no real patient data).

Persona: **Rafael, 57** — understands his numbers but never follows up over time.
Four lab reports across ~18 months. Glucose and HbA1c climb into RED; LDL sits in
AMBER (approaching out-of-range); everything else stays in range. This is enough to
exercise AT-1 (trend + flag) and AT-2 (one-tap action on a flagged marker).

Run as a module to (re)seed the SQLite DB and export the frontend seed JSON:

    uv run python -m app.data.synthetic
"""

from __future__ import annotations

import hashlib
import json
from datetime import date
from pathlib import Path

from sqlmodel import Session, select

from app.config import REPO_ROOT
from app.data.markers_catalog import MARKERS, get_marker
from app.models.db import engine, init_db
from app.models.domain import Marker, Measurement, Profile, Report

RAFAEL = {"name": "Rafael", "birth_year": 1969}

# (report_date, {marker_id: value}). Values are curated so the resulting statuses
# are stable and demo-worthy — glucose/hba1c end RED, ldl ends AMBER.
REPORTS: list[tuple[date, dict[str, float]]] = [
    (
        date(2024, 12, 15),
        {
            "glucose_fasting": 92, "hba1c": 5.4, "chol_total": 170, "ldl": 88, "hdl": 52,
            "triglycerides": 110, "creatinine": 0.9, "alt": 28, "tsh": 2.1,
            "vitamin_d": 42, "hemoglobin": 15.2,
        },
    ),
    (
        date(2025, 6, 20),
        {
            "glucose_fasting": 98, "hba1c": 5.6, "chol_total": 175, "ldl": 90, "hdl": 50,
            "triglycerides": 115, "creatinine": 0.95, "alt": 30, "tsh": 2.3,
            "vitamin_d": 40, "hemoglobin": 15.0,
        },
    ),
    (
        date(2026, 1, 10),
        {
            "glucose_fasting": 105, "hba1c": 5.9, "chol_total": 178, "ldl": 93, "hdl": 48,
            "triglycerides": 120, "creatinine": 1.0, "alt": 32, "tsh": 2.0,
            "vitamin_d": 38, "hemoglobin": 14.8,
        },
    ),
    (
        date(2026, 6, 30),
        {
            "glucose_fasting": 118, "hba1c": 6.3, "chol_total": 182, "ldl": 96, "hdl": 47,
            "triglycerides": 125, "creatinine": 1.02, "alt": 35, "tsh": 2.2,
            "vitamin_d": 41, "hemoglobin": 15.1,
        },
    ),
]


def _synthetic_hash(profile_name: str, report_date: date) -> str:
    """Deterministic pseudo file-hash so re-seeding stays idempotent."""
    return hashlib.sha256(f"synthetic:{profile_name}:{report_date.isoformat()}".encode()).hexdigest()


def seed_database() -> None:
    """Create tables and (idempotently) insert the catalog + Rafael's history."""
    init_db()
    with Session(engine) as session:
        _seed_markers(session)
        profile = _get_or_create_profile(session)
        for report_date, values in REPORTS:
            _seed_report(session, profile, report_date, values)
        session.commit()


def _seed_markers(session: Session) -> None:
    for spec in MARKERS:
        if session.get(Marker, spec.id) is None:
            session.add(
                Marker(
                    id=spec.id,
                    name=spec.name,
                    unit=spec.unit,
                    direction_of_concern=spec.direction_of_concern,
                )
            )
    session.commit()


def _get_or_create_profile(session: Session) -> Profile:
    existing = session.exec(select(Profile).where(Profile.name == RAFAEL["name"])).first()
    if existing:
        return existing
    profile = Profile(name=RAFAEL["name"], birth_year=RAFAEL["birth_year"])
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile


def _seed_report(
    session: Session, profile: Profile, report_date: date, values: dict[str, float]
) -> None:
    file_hash = _synthetic_hash(profile.name, report_date)
    report = session.exec(select(Report).where(Report.file_hash == file_hash)).first()
    if report is None:
        report = Report(
            profile_id=profile.id,
            source="synthetic",
            report_date=report_date,
            file_hash=file_hash,
        )
        session.add(report)
        session.commit()
        session.refresh(report)

    for marker_id, value in values.items():
        spec = get_marker(marker_id)
        exists = session.exec(
            select(Measurement).where(
                Measurement.profile_id == profile.id,
                Measurement.marker_id == marker_id,
                Measurement.date == report_date,
            )
        ).first()
        if exists is None:
            session.add(
                Measurement(
                    profile_id=profile.id,
                    marker_id=marker_id,
                    value=value,
                    unit=spec.unit,
                    date=report_date,
                    report_id=report.id,
                )
            )
    session.commit()


def build_seed_payload() -> dict:
    """Plain dict of the synthetic dataset, for the frontend seed / demo export."""
    return {
        "profile": {"name": RAFAEL["name"], "birthYear": RAFAEL["birth_year"]},
        "markers": [m.model_dump() for m in MARKERS],
        "measurements": [
            {
                "markerId": marker_id,
                "value": value,
                "unit": get_marker(marker_id).unit,
                "date": report_date.isoformat(),
            }
            for report_date, values in REPORTS
            for marker_id, value in values.items()
        ],
    }


def export_json(path: Path | None = None) -> Path:
    """Write the synthetic dataset to ``synthetic/rafael.json`` (demo/seed source)."""
    path = path or (REPO_ROOT / "synthetic" / "rafael.json")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(build_seed_payload(), ensure_ascii=False, indent=2), encoding="utf-8")
    return path


if __name__ == "__main__":
    seed_database()
    out = export_json()
    print(f"Seeded database and wrote {out}")
