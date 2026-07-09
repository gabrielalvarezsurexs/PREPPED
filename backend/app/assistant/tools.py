"""Engine-backed, read-only tools the assistant may call.

Each tool returns already-computed, deterministic data (series, statuses, trends,
curated reference ranges). The model can read these but cannot compute or invent
them — that is what keeps the chat grounded.
"""

from __future__ import annotations

from typing import Any

from app.data.reference_ranges import get_range
from app.engine.flags import flagged
from app.engine.trends import MarkerSeries


class GroundedData:
    """A snapshot of the profile's computed series, exposed to the tools."""

    def __init__(self, series: list[MarkerSeries]):
        self.series = series
        self._by_id = {s.marker_id: s for s in series}

    # --- tool implementations (return JSON-serializable plain data) ---

    def list_markers(self) -> dict[str, Any]:
        return {
            "markers": [
                {
                    "marker_id": s.marker_id,
                    "name": s.name,
                    "unit": s.unit,
                    "latest_value": s.latest_value,
                    "status": s.latest_status.value,
                    "trend": s.trend_direction,
                    "num_measurements": len(s.points),
                }
                for s in self.series
            ]
        }

    def get_flags(self) -> dict[str, Any]:
        return {
            "flags": [
                {
                    "marker_id": f.marker_id,
                    "name": f.name,
                    "status": f.status.value,
                    "latest_value": f.latest_value,
                    "unit": f.unit,
                    "trend": f.trend_direction,
                }
                for f in flagged(self.series)
            ]
        }

    def get_marker_detail(self, marker_id: str) -> dict[str, Any]:
        s = self._by_id.get(marker_id)
        if s is None:
            return {"error": f"No hay datos para el marcador '{marker_id}'."}
        rng = get_range(marker_id)
        return {
            "marker_id": s.marker_id,
            "name": s.name,
            "unit": s.unit,
            "direction_of_concern": s.direction_of_concern,
            "reference_range": {"low": rng.low, "high": rng.high},
            "latest_value": s.latest_value,
            "status": s.latest_status.value,
            "trend": s.trend_direction,
            "delta_vs_previous": s.delta,
            "points": [
                {"date": p.date.isoformat(), "value": p.value, "status": p.status.value}
                for p in s.points
            ],
        }

    def dispatch(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        if name == "list_markers":
            return self.list_markers()
        if name == "get_flags":
            return self.get_flags()
        if name == "get_marker_detail":
            return self.get_marker_detail(arguments.get("marker_id", ""))
        return {"error": f"Unknown tool: {name}"}


# OpenAI tool (function) specifications.
TOOL_SPECS: list[dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "list_markers",
            "description": (
                "Lista todos los marcadores del usuario con su último valor, unidad, "
                "estatus (in_range/amber/red) y tendencia, ya calculados por Prepped."
            ),
            "parameters": {"type": "object", "properties": {}, "additionalProperties": False},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_flags",
            "description": (
                "Devuelve solo los marcadores marcados (amber/red), del más severo al "
                "menos, ya calculados por Prepped."
            ),
            "parameters": {"type": "object", "properties": {}, "additionalProperties": False},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_marker_detail",
            "description": (
                "Detalle de un marcador: rango de referencia curado, serie temporal, "
                "estatus, tendencia y delta. Todo ya calculado por Prepped."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "marker_id": {
                        "type": "string",
                        "description": "Id del marcador, p. ej. 'glucose_fasting' o 'hba1c'.",
                    }
                },
                "required": ["marker_id"],
                "additionalProperties": False,
            },
        },
    },
]
