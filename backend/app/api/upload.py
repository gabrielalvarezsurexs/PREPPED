"""POST /api/upload — extract a lab report and ingest it idempotently (AT-3)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlmodel import Session

from app.api.common import get_current_profile
from app.extraction.client import ExtractionError, extract_lab_report
from app.ingest import compute_file_hash, persist_report
from app.models.db import get_session
from app.models.domain import Profile

router = APIRouter(prefix="/api", tags=["upload"])

_ALLOWED = {"application/pdf", "image/png", "image/jpeg", "image/webp"}


class UploadResponse(BaseModel):
    report_id: int | None
    duplicate_file: bool
    measurements_added: int
    measurements_deduped: int
    unrecognized: list[str]
    message: str


@router.post("/upload", response_model=UploadResponse)
async def upload_report(
    file: UploadFile = File(...),
    profile: Profile = Depends(get_current_profile),
    session: Session = Depends(get_session),
) -> UploadResponse:
    content_type = file.content_type or ""
    if content_type not in _ALLOWED and not (file.filename or "").lower().endswith(
        (".pdf", ".png", ".jpg", ".jpeg", ".webp")
    ):
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {content_type}")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file.")

    file_hash = compute_file_hash(file_bytes)

    # Short-circuit a re-upload of the same file (by this profile) WITHOUT calling the model.
    from sqlmodel import select

    from app.models.domain import Report

    already = session.exec(
        select(Report).where(Report.profile_id == profile.id, Report.file_hash == file_hash)
    ).first()
    if already:
        return UploadResponse(
            report_id=None,
            duplicate_file=True,
            measurements_added=0,
            measurements_deduped=0,
            unrecognized=[],
            message="Este archivo ya fue cargado antes. No se crearon duplicados.",
        )

    try:
        report = extract_lab_report(file_bytes, file.filename or "upload", content_type)
    except ExtractionError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    result = persist_report(session, profile.id, file_hash, report)
    return UploadResponse(
        report_id=result.report_id,
        duplicate_file=result.duplicate_file,
        measurements_added=result.measurements_added,
        measurements_deduped=result.measurements_deduped,
        unrecognized=result.unrecognized,
        message=(
            f"Se agregaron {result.measurements_added} mediciones al historial."
            if not result.duplicate_file
            else "Este archivo ya fue cargado antes. No se crearon duplicados."
        ),
    )
