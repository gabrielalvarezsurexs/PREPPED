"""Per-marker time series with trend direction and delta.

Pure functions over plain measurement inputs. The engine does not know about the
database; the API layer adapts DB rows into ``MeasurementInput`` objects.
"""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel

from app.data.markers_catalog import CATALOG
from app.engine.ranges import Status, classify, is_flagged


class MeasurementInput(BaseModel):
    marker_id: str
    value: float
    date: date


class SeriesPoint(BaseModel):
    date: date
    value: float
    status: Status


class MarkerSeries(BaseModel):
    marker_id: str
    name: str
    unit: str
    direction_of_concern: str
    points: list[SeriesPoint]
    latest_value: float
    latest_status: Status
    trend_direction: str  # "up" | "down" | "flat"
    delta: float  # latest value minus previous value (0 if single point)
    flagged: bool


def _trend_direction(previous: float | None, latest: float) -> tuple[str, float]:
    if previous is None:
        return "flat", 0.0
    delta = round(latest - previous, 4)
    if delta > 0:
        return "up", delta
    if delta < 0:
        return "down", delta
    return "flat", 0.0


def build_series(measurements: list[MeasurementInput]) -> list[MarkerSeries]:
    """Group measurements by marker, order by date, and classify each point.

    Returns one ``MarkerSeries`` per marker that has at least one measurement,
    ordered by the catalog order for stable presentation.
    """
    by_marker: dict[str, list[MeasurementInput]] = {}
    for m in measurements:
        by_marker.setdefault(m.marker_id, []).append(m)

    series: list[MarkerSeries] = []
    for marker_id in CATALOG:
        items = by_marker.get(marker_id)
        if not items:
            continue
        spec = CATALOG[marker_id]
        ordered = sorted(items, key=lambda x: x.date)
        points = [
            SeriesPoint(date=x.date, value=x.value, status=classify(marker_id, x.value))
            for x in ordered
        ]
        latest = points[-1]
        previous_value = points[-2].value if len(points) > 1 else None
        trend, delta = _trend_direction(previous_value, latest.value)
        series.append(
            MarkerSeries(
                marker_id=marker_id,
                name=spec.name,
                unit=spec.unit,
                direction_of_concern=spec.direction_of_concern,
                points=points,
                latest_value=latest.value,
                latest_status=latest.status,
                trend_direction=trend,
                delta=delta,
                flagged=is_flagged(latest.status),
            )
        )
    return series


def get_series(measurements: list[MeasurementInput], marker_id: str) -> MarkerSeries | None:
    """Convenience: the series for a single marker, or None if no data."""
    for s in build_series(measurements):
        if s.marker_id == marker_id:
            return s
    return None
