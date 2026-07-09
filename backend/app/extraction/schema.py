"""Pydantic schema for structured extraction output.

This is the contract the model must fill. It carries raw readings only — a marker
name as printed, a numeric value, and a unit. Normalization to canonical marker ids
and all judgement happen later, in deterministic code.
"""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field


class ExtractedMeasurement(BaseModel):
    marker_name: str = Field(description="Marker name exactly as printed on the report")
    value: float = Field(description="Numeric result value")
    unit: str = Field(default="", description="Unit as printed, e.g. mg/dL")


class LabReport(BaseModel):
    report_date: date = Field(description="Collection/report date on the study")
    measurements: list[ExtractedMeasurement] = Field(default_factory=list)
