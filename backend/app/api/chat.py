"""POST /api/chat — grounded assistant over the profile's computed data."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session

from app.api.common import DISCLAIMER, get_default_profile, load_measurements
from app.assistant.chat import ChatError, run_chat
from app.assistant.tools import GroundedData
from app.engine.trends import build_series
from app.models.db import get_session

router = APIRouter(prefix="/api", tags=["assistant"])

MAX_MESSAGES = 40
ALLOWED_ROLES = {"user", "assistant"}


class ChatTurn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatTurn] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    disclaimer: str


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, session: Session = Depends(get_session)) -> ChatResponse:
    if not payload.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")
    if len(payload.messages) > MAX_MESSAGES:
        raise HTTPException(status_code=400, detail="Conversation too long.")
    for turn in payload.messages:
        if turn.role not in ALLOWED_ROLES:
            raise HTTPException(status_code=400, detail=f"Invalid role: {turn.role}")

    profile = get_default_profile(session)
    measurements = load_measurements(session, profile.id)
    data = GroundedData(build_series(measurements))

    try:
        reply = run_chat([t.model_dump() for t in payload.messages], data)
    except ChatError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return ChatResponse(reply=reply, disclaimer=DISCLAIMER)
