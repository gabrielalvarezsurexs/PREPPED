"""OpenAI extraction client (vision + structured outputs).

``extract_lab_report`` is the single entry point. It sends the uploaded file to the
model with the extraction prompt and parses the response into a ``LabReport``.

Notes:
  * Requires ``OPENAI_API_KEY`` in the environment (see ``.env.example``).
  * Uses the Responses API structured-output parsing so the model returns data that
    already conforms to ``LabReport``.
  * Tests monkeypatch this function; they do not hit the network.
"""

from __future__ import annotations

import base64

from app.config import settings
from app.extraction.prompt import SYSTEM_PROMPT, USER_PROMPT
from app.extraction.schema import LabReport


class ExtractionError(RuntimeError):
    """Raised when extraction cannot be performed (e.g. no API key)."""


def _data_uri(file_bytes: bytes, content_type: str) -> str:
    encoded = base64.b64encode(file_bytes).decode("ascii")
    return f"data:{content_type};base64,{encoded}"


def _content_part(file_bytes: bytes, filename: str, content_type: str) -> dict:
    """Build the file/image content part for the Responses API input."""
    data_uri = _data_uri(file_bytes, content_type)
    if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
        return {"type": "input_file", "filename": filename, "file_data": data_uri}
    return {"type": "input_image", "image_url": data_uri}


def extract_lab_report(file_bytes: bytes, filename: str, content_type: str) -> LabReport:
    """Extract structured measurements from an uploaded lab report.

    This is the only function that talks to the LLM. It transcribes; it does not
    judge. Everything downstream is deterministic.
    """
    if not settings.llm_configured:
        raise ExtractionError(
            "OPENAI_API_KEY is not set. Add it to .env to enable extraction (AT-3)."
        )

    # Imported lazily so importing this module never requires the SDK to be present
    # or a key to be configured (keeps unit tests and the engine boundary clean).
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)

    response = client.responses.parse(
        model=settings.openai_model,
        input=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": USER_PROMPT},
                    _content_part(file_bytes, filename, content_type),
                ],
            },
        ],
        text_format=LabReport,
    )

    parsed = response.output_parsed
    if parsed is None:
        raise ExtractionError("Model returned no parseable structured output.")
    return parsed
