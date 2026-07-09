"""Shared route helpers: default profile resolution and measurement loading."""

from __future__ import annotations

from fastapi import HTTPException
from sqlmodel import Session, select

from app.engine.trends import MeasurementInput
from app.models.domain import Measurement, Profile

# Shown on every screen; the API echoes it so the frontend can render it verbatim.
DISCLAIMER = (
    "Prepped no es una herramienta de diagnóstico ni un asesor médico. No indica "
    "enfermedades, tratamientos, dosis ni dieta. La ausencia de una alerta no "
    "significa que todo esté bien. Consulta siempre a un profesional de salud."
)


def get_default_profile(session: Session) -> Profile:
    """Prototype has a single local profile: return the first one, or 404."""
    profile = session.exec(select(Profile).order_by(Profile.id)).first()
    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="No profile found. Seed the database: `uv run python -m app.data.synthetic`.",
        )
    return profile


def load_measurements(session: Session, profile_id: int) -> list[MeasurementInput]:
    """Load a profile's measurements as engine inputs (decoupled from DB rows)."""
    rows = session.exec(
        select(Measurement).where(Measurement.profile_id == profile_id)
    ).all()
    return [
        MeasurementInput(marker_id=r.marker_id, value=r.value, date=r.date) for r in rows
    ]
