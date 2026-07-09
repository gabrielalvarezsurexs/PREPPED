"""Range classification — the traffic light.

``classify`` maps a value to one of three statuses using ONLY the curated reference
table and the marker's direction of concern. No model, no invented ranges.

Rules (conservative):
  * "up"   markers: RED if value > high; AMBER if within ``amber_margin`` below high.
  * "down" markers: RED if value < low;  AMBER if within ``amber_margin`` above low.
  * "both" markers: RED if outside [low, high]; AMBER if within ``amber_margin`` of
                    either bound.
  * otherwise IN_RANGE.

IN_RANGE never means "you are fine" — it only means "not flagged by this rule".
"""

from __future__ import annotations

from enum import StrEnum

from app.data.markers_catalog import get_marker
from app.data.reference_ranges import get_range


class Status(StrEnum):
    IN_RANGE = "in_range"
    AMBER = "amber"
    RED = "red"


def classify(marker_id: str, value: float) -> Status:
    """Classify ``value`` for ``marker_id`` against the curated range."""
    spec = get_marker(marker_id)
    rng = get_range(marker_id)
    direction = spec.direction_of_concern

    over_high = value > rng.high
    under_low = value < rng.low
    near_high = rng.high - rng.amber_margin <= value <= rng.high
    near_low = rng.low <= value <= rng.low + rng.amber_margin

    if direction == "up":
        if over_high:
            return Status.RED
        if near_high:
            return Status.AMBER
    elif direction == "down":
        if under_low:
            return Status.RED
        if near_low:
            return Status.AMBER
    else:  # "both"
        if over_high or under_low:
            return Status.RED
        if near_high or near_low:
            return Status.AMBER

    return Status.IN_RANGE


def is_flagged(status: Status) -> bool:
    """A status is 'flagged' when it warrants a next step (amber or red)."""
    return status in (Status.AMBER, Status.RED)
