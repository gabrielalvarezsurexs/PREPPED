"""POST /api/auth/login and /api/auth/register — prototype account auth.

Login verifies the password and returns the profile id, which the frontend then
sends back on every request as ``X-Profile-Id``. This is deliberately prototype-grade
(no tokens/sessions); see ``app.auth`` and ``app.api.common.get_current_profile``.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.auth import hash_password, verify_password
from app.models.db import get_session
from app.models.domain import Profile

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1)
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class AuthResponse(BaseModel):
    profile_id: int
    name: str
    username: str


def _normalize_username(username: str) -> str:
    return username.strip().lower()


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, session: Session = Depends(get_session)) -> AuthResponse:
    username = _normalize_username(payload.username)
    profile = session.exec(select(Profile).where(Profile.username == username)).first()
    if profile is None or not verify_password(payload.password, profile.password_hash):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos.")
    return AuthResponse(profile_id=profile.id, name=profile.name, username=profile.username)


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest, session: Session = Depends(get_session)) -> AuthResponse:
    username = _normalize_username(payload.username)
    if not username:
        raise HTTPException(status_code=422, detail="El usuario no puede estar vacío.")

    existing = session.exec(select(Profile).where(Profile.username == username)).first()
    if existing is not None:
        raise HTTPException(status_code=409, detail="Ese usuario ya existe.")

    profile = Profile(
        name=payload.name.strip(),
        username=username,
        password_hash=hash_password(payload.password),
    )
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return AuthResponse(profile_id=profile.id, name=profile.name, username=profile.username)
