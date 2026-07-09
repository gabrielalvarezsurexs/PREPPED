"""Canonical marker catalog for the demo.

Each marker has a stable slug ``id``, a display name, a unit, and a
``direction_of_concern`` telling the engine which side is the worrying one:
    "up"   -> higher is worse (amber/red as the value climbs past the high bound)
    "down" -> lower is worse  (amber/red as the value drops past the low bound)
    "both" -> either extreme is worrying

This module holds identity only. The numeric reference ranges live in
``reference_ranges.py`` (curated). Together they feed the deterministic engine.
"""

from __future__ import annotations

from pydantic import BaseModel


class MarkerSpec(BaseModel):
    id: str
    name: str
    unit: str
    direction_of_concern: str  # "up" | "down" | "both"


MARKERS: list[MarkerSpec] = [
    MarkerSpec(id="glucose_fasting", name="Glucosa en ayuno", unit="mg/dL", direction_of_concern="up"),
    MarkerSpec(id="hba1c", name="Hemoglobina glicosilada (HbA1c)", unit="%", direction_of_concern="up"),
    MarkerSpec(id="chol_total", name="Colesterol total", unit="mg/dL", direction_of_concern="up"),
    MarkerSpec(id="ldl", name="Colesterol LDL", unit="mg/dL", direction_of_concern="up"),
    MarkerSpec(id="hdl", name="Colesterol HDL", unit="mg/dL", direction_of_concern="down"),
    MarkerSpec(id="triglycerides", name="Triglicéridos", unit="mg/dL", direction_of_concern="up"),
    MarkerSpec(id="creatinine", name="Creatinina", unit="mg/dL", direction_of_concern="up"),
    MarkerSpec(id="alt", name="ALT (TGP)", unit="U/L", direction_of_concern="up"),
    MarkerSpec(id="tsh", name="TSH", unit="mIU/L", direction_of_concern="both"),
    MarkerSpec(id="vitamin_d", name="Vitamina D (25-OH)", unit="ng/mL", direction_of_concern="down"),
    MarkerSpec(id="hemoglobin", name="Hemoglobina", unit="g/dL", direction_of_concern="both"),
]

CATALOG: dict[str, MarkerSpec] = {m.id: m for m in MARKERS}

# Synonyms used to normalize raw marker names coming out of extraction.
# Keys are lowercase; values are canonical marker ids.
_SYNONYMS: dict[str, str] = {
    "glucosa": "glucose_fasting",
    "glucosa en ayuno": "glucose_fasting",
    "glucosa en ayunas": "glucose_fasting",
    "glucose": "glucose_fasting",
    "fasting glucose": "glucose_fasting",
    "hba1c": "hba1c",
    "hemoglobina glicosilada": "hba1c",
    "hemoglobina glucosilada": "hba1c",
    "a1c": "hba1c",
    "colesterol total": "chol_total",
    "colesterol": "chol_total",
    "total cholesterol": "chol_total",
    "ldl": "ldl",
    "colesterol ldl": "ldl",
    "ldl colesterol": "ldl",
    "hdl": "hdl",
    "colesterol hdl": "hdl",
    "trigliceridos": "triglycerides",
    "triglicéridos": "triglycerides",
    "triglycerides": "triglycerides",
    "creatinina": "creatinine",
    "creatinine": "creatinine",
    "alt": "alt",
    "tgp": "alt",
    "alt (tgp)": "alt",
    "tsh": "tsh",
    "vitamina d": "vitamin_d",
    "vitamin d": "vitamin_d",
    "25-oh": "vitamin_d",
    "hemoglobina": "hemoglobin",
    "hemoglobin": "hemoglobin",
    "hb": "hemoglobin",
}


def get_marker(marker_id: str) -> MarkerSpec:
    """Return the catalog entry for ``marker_id`` or raise KeyError."""
    return CATALOG[marker_id]


def normalize_marker_name(raw_name: str) -> str | None:
    """Map a raw (possibly messy) marker name to a canonical id, or None.

    Deterministic table lookup — never a model call.
    """
    key = raw_name.strip().lower()
    if key in _SYNONYMS:
        return _SYNONYMS[key]
    # Fall back to an exact catalog-id or display-name match.
    if key in CATALOG:
        return key
    for marker in MARKERS:
        if marker.name.lower() == key:
            return marker.id
    return None
