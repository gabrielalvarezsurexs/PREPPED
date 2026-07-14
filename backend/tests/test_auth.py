"""Prototype auth: login verifies the password, register creates an account."""

from __future__ import annotations

from tests.conftest import TEST_PASSWORD, seed_profile


def test_login_success_returns_profile(client, session):
    profile = seed_profile(session, name="Rafael", username="rafael")

    resp = client.post(
        "/api/auth/login", json={"username": "rafael", "password": TEST_PASSWORD}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["profile_id"] == profile.id
    assert body["name"] == "Rafael"
    assert body["username"] == "rafael"


def test_login_is_case_insensitive_on_username(client, session):
    seed_profile(session, name="Rafael", username="rafael")
    resp = client.post(
        "/api/auth/login", json={"username": "RAFAEL", "password": TEST_PASSWORD}
    )
    assert resp.status_code == 200


def test_login_wrong_password_rejected(client, session):
    seed_profile(session, name="Rafael", username="rafael")
    resp = client.post(
        "/api/auth/login", json={"username": "rafael", "password": "wrong"}
    )
    assert resp.status_code == 401


def test_login_unknown_user_rejected(client, session):
    resp = client.post(
        "/api/auth/login", json={"username": "nobody", "password": TEST_PASSWORD}
    )
    assert resp.status_code == 401


def test_register_creates_account_and_can_login(client, session):
    resp = client.post(
        "/api/auth/register",
        json={"name": "Nuevo", "username": "Nuevo", "password": "secret123"},
    )
    assert resp.status_code == 201
    assert resp.json()["username"] == "nuevo"  # normalized

    login = client.post(
        "/api/auth/login", json={"username": "nuevo", "password": "secret123"}
    )
    assert login.status_code == 200
    assert login.json()["profile_id"] == resp.json()["profile_id"]


def test_register_duplicate_username_conflicts(client, session):
    seed_profile(session, name="Rafael", username="rafael")
    resp = client.post(
        "/api/auth/register",
        json={"name": "Otro", "username": "rafael", "password": "x"},
    )
    assert resp.status_code == 409
