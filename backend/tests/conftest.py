"""Test fixtures: an isolated temp SQLite DB and a TestClient.

The DATABASE_URL is redirected to a throwaway temp file BEFORE any app module is
imported, so tests never touch a real ``prepped.db``.
"""

from __future__ import annotations

import os
import tempfile
from collections.abc import Iterator
from datetime import date

import pytest

# Redirect the DB before importing anything from ``app`` (settings read env once).
_tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_tmp.close()
os.environ["DATABASE_URL"] = "sqlite:///" + _tmp.name.replace("\\", "/")

from fastapi import Header  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlmodel import Session, SQLModel, select  # noqa: E402

from app.api.common import get_current_profile  # noqa: E402
from app.auth import hash_password  # noqa: E402
from app.data.markers_catalog import MARKERS, get_marker  # noqa: E402
from app.main import app  # noqa: E402
from app.models.db import engine, get_session  # noqa: E402
from app.models.domain import Marker, Measurement, Profile  # noqa: E402

# Default password for profiles seeded in tests.
TEST_PASSWORD = "12345678"


@pytest.fixture(autouse=True)
def _fresh_schema() -> Iterator[None]:
    """Recreate the schema before each test for isolation."""
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield


@pytest.fixture
def session() -> Iterator[Session]:
    with Session(engine) as s:
        yield s


@pytest.fixture
def client(session: Session) -> Iterator[TestClient]:
    """TestClient that resolves identity from ``X-Profile-Id`` when present, else the
    first seeded profile — so single-profile tests need not pass the header, while
    isolation tests can target a specific profile explicitly."""

    def _current_profile(
        x_profile_id: int | None = Header(default=None, alias="X-Profile-Id"),
    ) -> Profile:
        if x_profile_id is not None:
            profile = session.get(Profile, x_profile_id)
            if profile is not None:
                return profile
        return session.exec(select(Profile).order_by(Profile.id)).first()

    app.dependency_overrides[get_session] = lambda: session
    app.dependency_overrides[get_current_profile] = _current_profile
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def raw_client(session: Session) -> Iterator[TestClient]:
    """TestClient with the real (strict) ``get_current_profile`` — for testing that a
    missing/invalid ``X-Profile-Id`` header is rejected."""
    app.dependency_overrides[get_session] = lambda: session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def auth_headers(profile: Profile) -> dict[str, str]:
    return {"X-Profile-Id": str(profile.id)}


def seed_catalog(session: Session) -> None:
    for spec in MARKERS:
        if session.get(Marker, spec.id) is None:
            session.add(
                Marker(
                    id=spec.id,
                    name=spec.name,
                    unit=spec.unit,
                    direction_of_concern=spec.direction_of_concern,
                )
            )
    session.commit()


def seed_profile(
    session: Session,
    name: str = "Rafael",
    username: str | None = None,
    password: str = TEST_PASSWORD,
) -> Profile:
    profile = Profile(
        name=name,
        birth_year=1969,
        username=(username or name.lower()),
        password_hash=hash_password(password),
    )
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile


def add_measurement(
    session: Session, profile_id: int, marker_id: str, value: float, on: date
) -> None:
    session.add(
        Measurement(
            profile_id=profile_id,
            marker_id=marker_id,
            value=value,
            unit=get_marker(marker_id).unit,
            date=on,
        )
    )
    session.commit()
