"""AT-1: with 2+ reports and a marker out of range, results show a time series with
the latest point flagged (red/amber), not a single number."""

from __future__ import annotations

from datetime import date

from tests.conftest import add_measurement, seed_catalog, seed_profile


def test_out_of_range_marker_shows_flagged_series(client, session):
    seed_catalog(session)
    profile = seed_profile(session)

    # Two reports; glucose climbs from in-range/amber into red.
    add_measurement(session, profile.id, "glucose_fasting", 98, date(2025, 6, 20))
    add_measurement(session, profile.id, "glucose_fasting", 118, date(2026, 6, 30))

    resp = client.get("/api/history")
    assert resp.status_code == 200
    data = resp.json()

    glucose = next(s for s in data["series"] if s["marker_id"] == "glucose_fasting")

    # A series over time, not a single value.
    assert len(glucose["points"]) == 2
    # Latest point is flagged red and the trend is up.
    assert glucose["latest_status"] == "red"
    assert glucose["flagged"] is True
    assert glucose["trend_direction"] == "up"
    assert glucose["points"][-1]["status"] == "red"

    # It also surfaces in the flags list, worst-first.
    flag_ids = [f["marker_id"] for f in data["flags"]]
    assert "glucose_fasting" in flag_ids


def test_disclaimer_present_on_history(client, session):
    seed_catalog(session)
    profile = seed_profile(session)
    add_measurement(session, profile.id, "hba1c", 5.4, date(2025, 6, 20))

    data = client.get("/api/history").json()
    assert "no es una herramienta de diagnóstico" in data["disclaimer"].lower()
