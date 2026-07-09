"""Flags on the latest point of each series.

A thin layer over ``trends``/``ranges`` that answers: which markers are currently
flagged, and how severe? Ordering puts RED before AMBER so the UI can surface the
most concerning markers first. Escalation is by fixed thresholds only.
"""

from __future__ import annotations

from pydantic import BaseModel

from app.engine.ranges import Status
from app.engine.trends import MarkerSeries

_SEVERITY = {Status.RED: 2, Status.AMBER: 1, Status.IN_RANGE: 0}


class Flag(BaseModel):
    marker_id: str
    name: str
    status: Status
    latest_value: float
    unit: str
    trend_direction: str


def flagged(series: list[MarkerSeries]) -> list[Flag]:
    """Return flags for markers whose latest point is amber or red, worst first."""
    result = [
        Flag(
            marker_id=s.marker_id,
            name=s.name,
            status=s.latest_status,
            latest_value=s.latest_value,
            unit=s.unit,
            trend_direction=s.trend_direction,
        )
        for s in series
        if s.flagged
    ]
    result.sort(key=lambda f: _SEVERITY[f.status], reverse=True)
    return result
