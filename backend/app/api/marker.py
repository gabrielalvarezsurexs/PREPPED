"""GET /api/marker/{marker_id} — one marker's series plus its pre-armed action."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from app.api.common import DISCLAIMER, get_default_profile, load_measurements
from app.data.markers_catalog import CATALOG
from app.engine.actions import PreArmedAction, for_marker
from app.engine.ranges import is_flagged
from app.engine.trends import MarkerSeries, get_series
from app.models.db import get_session

router = APIRouter(prefix="/api", tags=["marker"])


class MarkerResponse(BaseModel):
    series: MarkerSeries
    # Present only when the latest point is flagged (amber/red). The absence of an
    # action is not an 'all good' — the UI still shows the neutral series.
    action: PreArmedAction | None
    disclaimer: str


@router.get("/marker/{marker_id}", response_model=MarkerResponse)
def get_marker_detail(
    marker_id: str, session: Session = Depends(get_session)
) -> MarkerResponse:
    if marker_id not in CATALOG:
        raise HTTPException(status_code=404, detail=f"Unknown marker: {marker_id}")

    profile = get_default_profile(session)
    measurements = load_measurements(session, profile.id)
    series = get_series(measurements, marker_id)
    if series is None:
        raise HTTPException(status_code=404, detail="No measurements for this marker yet.")

    action = None
    if is_flagged(series.latest_status):
        action = for_marker(
            marker_id, series.latest_status, series.latest_value, series.trend_direction
        )

    return MarkerResponse(series=series, action=action, disclaimer=DISCLAIMER)
