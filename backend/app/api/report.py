"""GET /api/reports and DELETE /api/report/{id} — manage a profile's uploaded studies.

Lets a user list and remove studies (e.g. a bad upload). Deletion is scoped to the
current profile so one account can never touch another's reports.
"""

from __future__ import annotations

from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, func, select

from app.api.common import get_current_profile
from app.models.db import get_session
from app.models.domain import Measurement, Profile, Report

router = APIRouter(prefix="/api", tags=["report"])


class ReportSummary(BaseModel):
    id: int
    report_date: date
    source: str
    created_at: datetime
    measurement_count: int


class DeleteResponse(BaseModel):
    deleted_report_id: int
    measurements_deleted: int


@router.get("/reports", response_model=list[ReportSummary])
def list_reports(
    profile: Profile = Depends(get_current_profile),
    session: Session = Depends(get_session),
) -> list[ReportSummary]:
    rows = session.exec(
        select(Report).where(Report.profile_id == profile.id).order_by(Report.report_date.desc())
    ).all()
    summaries: list[ReportSummary] = []
    for report in rows:
        count = session.exec(
            select(func.count()).select_from(Measurement).where(Measurement.report_id == report.id)
        ).one()
        summaries.append(
            ReportSummary(
                id=report.id,
                report_date=report.report_date,
                source=report.source,
                created_at=report.created_at,
                measurement_count=count,
            )
        )
    return summaries


@router.delete("/report/{report_id}", response_model=DeleteResponse)
def delete_report(
    report_id: int,
    profile: Profile = Depends(get_current_profile),
    session: Session = Depends(get_session),
) -> DeleteResponse:
    report = session.get(Report, report_id)
    if report is None or report.profile_id != profile.id:
        raise HTTPException(status_code=404, detail="Report not found.")

    measurements = session.exec(
        select(Measurement).where(Measurement.report_id == report_id)
    ).all()
    deleted = len(measurements)
    for measurement in measurements:
        session.delete(measurement)
    session.delete(report)
    session.commit()
    return DeleteResponse(deleted_report_id=report_id, measurements_deleted=deleted)
