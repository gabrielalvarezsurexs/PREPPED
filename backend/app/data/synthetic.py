"""Synthetic longitudinal demo data (100% fake — no real patient data).

Three seeded accounts (all password ``Hola5000``) to exercise the multi-user app:

  * **Test User** (``test_user``) — four reports across ~18 months. Glucose and HbA1c
    climb into RED, LDL sits in AMBER; the rest stay in range. The default showcase
    account: exercises AT-1/AT-2 out of the box.
  * **Karla** (``karla``), 34 — two reports, mostly in range with vitamin D drifting
    into AMBER. A lighter dataset.
  * **Gabriel** (``gabriel``) — no reports. The empty-state account.

Run as a module to (re)seed the SQLite DB and export the demo JSON:

    uv run python -m app.data.synthetic
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

from sqlmodel import Session, select

from app.auth import hash_password
from app.config import REPO_ROOT
from app.data.markers_catalog import MARKERS, get_marker
from app.models.db import engine, init_db
from app.models.domain import Marker, Measurement, Profile, Report

# Shared password for every seeded demo account (prototype/testing only). Chosen to
# avoid common breach lists so the browser's password manager doesn't flag it.
DEMO_PASSWORD = "Hola5000"


@dataclass
class Persona:
    name: str
    username: str
    birth_year: int
    # (report_date, {marker_id: value}); empty list => empty-state account.
    reports: list[tuple[date, dict[str, float]]] = field(default_factory=list)


# Values are curated so the resulting statuses are stable and demo-worthy.
PERSONAS: list[Persona] = [
    Persona(
        name="Test User",
        username="test_user",
        birth_year=1969,
        reports=[
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
        ],
    ),
    Persona(
        name="Karla",
        username="karla",
        birth_year=1992,
        reports=[
            (
                date(2025, 9, 1),
                {
                    "glucose_fasting": 88, "hba1c": 5.1, "chol_total": 165, "ldl": 80, "hdl": 62,
                    "triglycerides": 95, "creatinine": 0.8, "alt": 20, "tsh": 1.8,
                    "vitamin_d": 36, "hemoglobin": 13.9,
                },
            ),
            (
                date(2026, 3, 15),
                {
                    "glucose_fasting": 90, "hba1c": 5.2, "chol_total": 170, "ldl": 82, "hdl": 60,
                    "triglycerides": 100, "creatinine": 0.82, "alt": 22, "tsh": 1.9,
                    "vitamin_d": 33, "hemoglobin": 14.0,
                },
            ),
        ],
    ),
    Persona(name="Gabriel", username="gabriel", birth_year=1990, reports=[]),
]

# The persona whose dataset is exported for the demo JSON.
_EXPORT_USERNAME = "test_user"


def _synthetic_hash(username: str, report_date: date) -> str:
    """Deterministic pseudo file-hash so re-seeding stays idempotent (per user)."""
    return hashlib.sha256(
        f"synthetic:{username}:{report_date.isoformat()}".encode()
    ).hexdigest()


def seed_database() -> None:
    """Create tables and (idempotently) insert the catalog + all demo personas."""
    init_db()
    with Session(engine) as session:
        _seed_markers(session)
        for persona in PERSONAS:
            profile = _get_or_create_profile(session, persona)
            for report_date, values in persona.reports:
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


def _get_or_create_profile(session: Session, persona: Persona) -> Profile:
    existing = session.exec(
        select(Profile).where(Profile.username == persona.username)
    ).first()
    if existing:
        # Demo personas are authoritative: re-seeding resets name and password to
        # the current values (so a password change here takes effect on re-seed).
        existing.name = persona.name
        existing.birth_year = persona.birth_year
        existing.password_hash = hash_password(DEMO_PASSWORD)
        session.add(existing)
        session.commit()
        return existing
    profile = Profile(
        name=persona.name,
        username=persona.username,
        birth_year=persona.birth_year,
        password_hash=hash_password(DEMO_PASSWORD),
    )
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile


def _seed_report(
    session: Session, profile: Profile, report_date: date, values: dict[str, float]
) -> None:
    file_hash = _synthetic_hash(profile.username, report_date)
    report = session.exec(
        select(Report).where(
            Report.profile_id == profile.id, Report.file_hash == file_hash
        )
    ).first()
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
    """Plain dict of the exported persona's dataset (frontend demo/seed export)."""
    persona = next(p for p in PERSONAS if p.username == _EXPORT_USERNAME)
    return {
        "profile": {"name": persona.name, "birthYear": persona.birth_year},
        "markers": [m.model_dump() for m in MARKERS],
        "measurements": [
            {
                "markerId": marker_id,
                "value": value,
                "unit": get_marker(marker_id).unit,
                "date": report_date.isoformat(),
            }
            for report_date, values in persona.reports
            for marker_id, value in values.items()
        ],
    }


def export_json(path: Path | None = None) -> Path:
    """Write the exported persona's dataset to ``synthetic/test_user.json``."""
    path = path or (REPO_ROOT / "synthetic" / "test_user.json")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(build_seed_payload(), ensure_ascii=False, indent=2), encoding="utf-8")
    return path


if __name__ == "__main__":
    seed_database()
    out = export_json()
    print(f"Seeded database ({len(PERSONAS)} accounts) and wrote {out}")
