"""Pre-armed follow-up actions for a flagged marker (AT-2).

Every string here is CURATED and deterministic. No diagnosis, no treatment, no
dosage, no diet, and never reassurance. (LLM verbalization of this copy is a
post-green enhancement; today the text is fixed templates.)

An action bundles three things the user can act on in one tap:
  * ``plain_language`` — neutral explanation of what the latest number is doing.
  * ``doctor_question`` — a ready question to ask a health professional.
  * ``reminder``        — a pre-armed reminder (book a checkup) to activate.
"""

from __future__ import annotations

from pydantic import BaseModel

from app.data.markers_catalog import get_marker
from app.engine.ranges import Status
from app.models.domain import ReminderType


class ReminderSuggestion(BaseModel):
    type: ReminderType
    label: str


class PreArmedAction(BaseModel):
    marker_id: str
    status: Status
    plain_language: str
    doctor_question: str
    reminder: ReminderSuggestion


def _direction_phrase(direction: str, status: Status) -> str:
    """Neutral phrase for where the value sits relative to the reference range."""
    if status == Status.RED:
        if direction == "up":
            return "está por encima del rango de referencia"
        if direction == "down":
            return "está por debajo del rango de referencia"
        return "está fuera del rango de referencia"
    # AMBER
    return "está dentro del rango pero acercándose al límite"


def for_marker(marker_id: str, status: Status, latest_value: float, trend_direction: str) -> PreArmedAction:
    """Build the pre-armed action for a flagged marker.

    Only AMBER/RED produce an action; callers should not build actions for
    in-range markers (the absence of a flag is not an 'all good').
    """
    spec = get_marker(marker_id)
    where = _direction_phrase(spec.direction_of_concern, status)

    trend_note = ""
    if trend_direction == "up":
        trend_note = " y ha ido subiendo en tus últimos estudios"
    elif trend_direction == "down":
        trend_note = " y ha ido bajando en tus últimos estudios"

    plain_language = (
        f"Tu {spec.name} más reciente ({latest_value:g} {spec.unit}) {where}{trend_note}. "
        "Esto es algo para revisar con un profesional de salud. "
        "Prepped no diagnostica ni indica tratamiento."
    )

    doctor_question = (
        f"Mi {spec.name} salió en {latest_value:g} {spec.unit}. "
        "¿Qué significa en mi caso y cómo debería darle seguimiento?"
    )

    reminder = ReminderSuggestion(
        type=ReminderType.BOOK_CHECKUP,
        label="Poner recordatorio para agendar un chequeo",
    )

    return PreArmedAction(
        marker_id=marker_id,
        status=status,
        plain_language=plain_language,
        doctor_question=doctor_question,
        reminder=reminder,
    )
