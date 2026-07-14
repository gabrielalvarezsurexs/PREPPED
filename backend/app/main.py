"""FastAPI application entrypoint.

Wires CORS and the four routers. The deterministic engine and the LLM extraction
sit behind these routes; this module contains no health logic.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, chat, history, marker, reminder, report, upload
from app.api.common import DISCLAIMER
from app.config import settings
from app.models.db import init_db


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_db()
    yield


app = FastAPI(
    title="Prepped API",
    version="0.1.0",
    description="Deterministic health engine + LLM extraction (AT-3).",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["meta"])
def health() -> dict:
    return {
        "status": "ok",
        "llm_configured": settings.llm_configured,
        "disclaimer": DISCLAIMER,
    }


app.include_router(auth.router)
app.include_router(history.router)
app.include_router(marker.router)
app.include_router(reminder.router)
app.include_router(report.router)
app.include_router(upload.router)
app.include_router(chat.router)
