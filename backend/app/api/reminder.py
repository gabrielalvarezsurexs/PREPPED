"""POST /api/reminder — activate a pre-armed reminder for a flagged marker (AT-2)."""

from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.common import get_current_profile
from app.data.markers_catalog import CATALOG
from app.models.db import get_session
from app.models.domain import Profile, Reminder, ReminderType

router = APIRouter(prefix="/api", tags=["reminder"])

# Default: nudge to book a checkup in ~30 days.
DEFAULT_DUE_DAYS = 30


class ReminderCreate(BaseModel):
    marker_id: str
    type: ReminderType = ReminderType.BOOK_CHECKUP


class ReminderResponse(BaseModel):
    id: int
    marker_id: str
    type: ReminderType
    due_date: date | None
    already_existed: bool


@router.post("/reminder", response_model=ReminderResponse)
def create_reminder(
    payload: ReminderCreate,
    profile: Profile = Depends(get_current_profile),
    session: Session = Depends(get_session),
) -> ReminderResponse:
    if payload.marker_id not in CATALOG:
        raise HTTPException(status_code=404, detail=f"Unknown marker: {payload.marker_id}")

    # Idempotent: one active reminder per (profile, marker, type).
    existing = session.exec(
        select(Reminder).where(
            Reminder.profile_id == profile.id,
            Reminder.marker_id == payload.marker_id,
            Reminder.type == payload.type,
        )
    ).first()
    if existing is not None:
        return ReminderResponse(
            id=existing.id,
            marker_id=existing.marker_id,
            type=existing.type,
            due_date=existing.due_date,
            already_existed=True,
        )

    reminder = Reminder(
        profile_id=profile.id,
        marker_id=payload.marker_id,
        type=payload.type,
        due_date=date.today() + timedelta(days=DEFAULT_DUE_DAYS),
    )
    session.add(reminder)
    session.commit()
    session.refresh(reminder)
    return ReminderResponse(
        id=reminder.id,
        marker_id=reminder.marker_id,
        type=reminder.type,
        due_date=reminder.due_date,
        already_existed=False,
    )
