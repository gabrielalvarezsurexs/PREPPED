"""GET /api/history — every marker's series plus the current flags."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session

from app.api.common import DISCLAIMER, get_default_profile, load_measurements
from app.engine.flags import Flag, flagged
from app.engine.trends import MarkerSeries, build_series
from app.models.db import get_session

router = APIRouter(prefix="/api", tags=["history"])


class HistoryResponse(BaseModel):
    profile_id: int
    profile_name: str
    series: list[MarkerSeries]
    flags: list[Flag]
    disclaimer: str


@router.get("/history", response_model=HistoryResponse)
def get_history(session: Session = Depends(get_session)) -> HistoryResponse:
    profile = get_default_profile(session)
    measurements = load_measurements(session, profile.id)
    series = build_series(measurements)
    return HistoryResponse(
        profile_id=profile.id,
        profile_name=profile.name,
        series=series,
        flags=flagged(series),
        disclaimer=DISCLAIMER,
    )
