"""Relational domain model (SQLModel).

Prototype uses SQLite, but the schema shape matches the PostgreSQL north-star so
the migration later is a connection-string change, not a redesign.

Idempotency (AT-3) rests on two things:
  * ``Report.file_hash`` short-circuits a re-upload of the exact same file.
  * ``Measurement`` is de-duplicated by (profile_id, marker_id, date).
"""

from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum

from sqlmodel import Field, SQLModel, UniqueConstraint


class Profile(SQLModel, table=True):
    """A person whose labs are tracked. Prototype: a single local profile."""

    __tablename__ = "profiles"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    birth_year: int | None = None


class Marker(SQLModel, table=True):
    """Canonical marker catalog row (seeded from ``data.markers_catalog``)."""

    __tablename__ = "markers"

    # Slug id (e.g. "glucose_fasting") kept stable across DB and code.
    id: str = Field(primary_key=True)
    name: str
    unit: str
    direction_of_concern: str  # "up" | "down" | "both"


class Report(SQLModel, table=True):
    """An uploaded study. ``file_hash`` makes re-uploads idempotent."""

    __tablename__ = "reports"
    __table_args__ = (UniqueConstraint("file_hash", name="uq_report_file_hash"),)

    id: int | None = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="profiles.id")
    source: str = "upload"  # "upload" | "synthetic"
    report_date: date
    file_hash: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Measurement(SQLModel, table=True):
    """A single marker value on a given date. Deduped by (profile, marker, date)."""

    __tablename__ = "measurements"
    __table_args__ = (
        UniqueConstraint(
            "profile_id", "marker_id", "date", name="uq_measurement_profile_marker_date"
        ),
    )

    id: int | None = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="profiles.id")
    marker_id: str = Field(foreign_key="markers.id")
    value: float
    unit: str
    date: date
    report_id: int | None = Field(default=None, foreign_key="reports.id")


class ReminderType(StrEnum):
    BOOK_CHECKUP = "book_checkup"
    ASK_DOCTOR = "ask_doctor"


class Reminder(SQLModel, table=True):
    """A pre-armed follow-up the user activated for a flagged marker (AT-2)."""

    __tablename__ = "reminders"

    id: int | None = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="profiles.id")
    marker_id: str = Field(foreign_key="markers.id")
    type: ReminderType
    due_date: date | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
