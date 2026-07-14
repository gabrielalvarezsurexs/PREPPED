"""Shared route helpers: profile resolution and measurement loading."""

from __future__ import annotations

from fastapi import Depends, Header, HTTPException
from sqlmodel import Session, select

from app.engine.trends import MeasurementInput
from app.models.db import get_session
from app.models.domain import Measurement, Profile

# Shown on every screen; the API echoes it so the frontend can render it verbatim.
DISCLAIMER = (
    "Prepped no es una herramienta de diagnóstico ni un asesor médico. No indica "
    "enfermedades, tratamientos, dosis ni dieta. La ausencia de una alerta no "
    "significa que todo esté bien. Consulta siempre a un profesional de salud."
)


def get_default_profile(session: Session) -> Profile:
    """The first profile ordered by id, or 404. Used by seeding/tests, not routes."""
    profile = session.exec(select(Profile).order_by(Profile.id)).first()
    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="No profile found. Seed the database: `uv run python -m app.data.synthetic`.",
        )
    return profile


def get_current_profile(
    x_profile_id: int | None = Header(default=None, alias="X-Profile-Id"),
    session: Session = Depends(get_session),
) -> Profile:
    """Resolve the logged-in profile from the ``X-Profile-Id`` header.

    Prototype identity: the frontend stores the profile id at login and sends it
    back on every request. Spoofable by design for this testing stage; real
    tokens/sessions are out of scope.
    """
    if x_profile_id is None:
        raise HTTPException(status_code=401, detail="Missing X-Profile-Id header.")
    profile = session.get(Profile, x_profile_id)
    if profile is None:
        raise HTTPException(status_code=401, detail="Unknown profile.")
    return profile


def load_measurements(session: Session, profile_id: int) -> list[MeasurementInput]:
    """Load a profile's measurements as engine inputs (decoupled from DB rows)."""
    rows = session.exec(
        select(Measurement).where(Measurement.profile_id == profile_id)
    ).all()
    return [
        MeasurementInput(marker_id=r.marker_id, value=r.value, date=r.date) for r in rows
    ]
