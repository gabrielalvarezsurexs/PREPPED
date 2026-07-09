"""AT-2: a flagged marker yields a ready next step in one tap (a doctor question or a
reminder), with nothing to type."""

from __future__ import annotations

from datetime import date

from tests.conftest import add_measurement, seed_catalog, seed_profile


def test_flagged_marker_returns_prearmed_action(client, session):
    seed_catalog(session)
    profile = seed_profile(session)
    add_measurement(session, profile.id, "glucose_fasting", 98, date(2025, 6, 20))
    add_measurement(session, profile.id, "glucose_fasting", 118, date(2026, 6, 30))

    resp = client.get("/api/marker/glucose_fasting")
    assert resp.status_code == 200
    data = resp.json()

    action = data["action"]
    assert action is not None
    # Ready to use, nothing to type: a pre-written question and a pre-armed reminder.
    assert action["doctor_question"].strip()
    assert action["reminder"]["type"] == "book_checkup"
    assert action["reminder"]["label"].strip()
    # No diagnosis / reassurance leaking into the copy.
    lowered = action["plain_language"].lower()
    assert "diagnostica" in lowered or "diagnóstico" in lowered  # explicitly disclaims


def test_in_range_marker_has_no_action(client, session):
    seed_catalog(session)
    profile = seed_profile(session)
    add_measurement(session, profile.id, "tsh", 2.1, date(2025, 6, 20))
    add_measurement(session, profile.id, "tsh", 2.2, date(2026, 6, 30))

    data = client.get("/api/marker/tsh").json()
    assert data["action"] is None  # absence of a flag is not an 'all good' banner


def test_reminder_is_one_tap_and_idempotent(client, session):
    seed_catalog(session)
    profile = seed_profile(session)
    add_measurement(session, profile.id, "glucose_fasting", 118, date(2026, 6, 30))

    first = client.post("/api/reminder", json={"marker_id": "glucose_fasting"})
    assert first.status_code == 200
    assert first.json()["already_existed"] is False

    # Tapping again does not create a duplicate.
    second = client.post("/api/reminder", json={"marker_id": "glucose_fasting"})
    assert second.json()["already_existed"] is True
    assert second.json()["id"] == first.json()["id"]
