"""Extraction prompt, scoped to the demo lab formats.

Deliberately narrow: transcribe what is printed, do not interpret. The prompt lists
the demo markers we care about so the model can ignore unrelated rows, but it must
never decide whether a value is normal.
"""

from __future__ import annotations

from app.data.markers_catalog import MARKERS

_MARKER_HINTS = ", ".join(f"{m.name} ({m.unit})" for m in MARKERS)

SYSTEM_PROMPT = (
    "You are a careful transcriber of laboratory reports. Read the provided lab "
    "report (image or PDF) and return ONLY the structured data requested. "
    "Transcribe exactly what is printed. Do NOT interpret, judge, flag, diagnose, "
    "or decide whether any value is normal or abnormal. Do NOT invent reference "
    "ranges. If a field is unreadable, omit that measurement.\n\n"
    "Markers of interest for this demo (transcribe these when present; ignore "
    f"unrelated rows): {_MARKER_HINTS}.\n"
    "Return the report date and one entry per measurement with the marker name as "
    "printed, its numeric value, and its unit."
)

USER_PROMPT = (
    "Extract the report date and all lab measurements from this study as structured "
    "data. Values must be numbers only; keep units separate."
)
