"""Database engine and session helpers (SQLModel + SQLite)."""

from __future__ import annotations

from collections.abc import Iterator

from sqlmodel import Session, SQLModel, create_engine

from app.config import settings

# ``check_same_thread`` is a SQLite-only knob; harmless to pass for the prototype.
_connect_args = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)

engine = create_engine(settings.database_url, echo=False, connect_args=_connect_args)


def init_db() -> None:
    """Create all tables. Importing domain models registers them on the metadata."""
    from app.models import domain  # noqa: F401  (side-effect: register tables)

    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    """FastAPI dependency: yield a scoped session."""
    with Session(engine) as session:
        yield session
