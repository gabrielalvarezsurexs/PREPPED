"""The grounded chat loop: OpenAI tool-calling over engine-backed data.

``run_chat`` prepends the system prompt, lets the model call read-only tools to fetch
the user's computed data, feeds results back, and returns the final assistant text.
The OpenAI client is injectable so tests can run the loop offline.
"""

from __future__ import annotations

import json
from typing import Any, Protocol

from app.assistant.prompt import SYSTEM_PROMPT
from app.assistant.tools import TOOL_SPECS, GroundedData
from app.config import settings

MAX_TOOL_ROUNDS = 4


class ChatError(RuntimeError):
    """Raised when the assistant cannot run (e.g. no API key)."""


class ChatMessage(Protocol):
    role: str
    content: str


def _build_client() -> Any:
    if not settings.llm_configured:
        raise ChatError(
            "OPENAI_API_KEY is not set. Add it to .env to enable the assistant."
        )
    from openai import OpenAI

    return OpenAI(api_key=settings.openai_api_key)


def _normalize_tool_calls(tool_calls: Any) -> list[dict[str, Any]]:
    return [
        {
            "id": tc.id,
            "type": "function",
            "function": {"name": tc.function.name, "arguments": tc.function.arguments},
        }
        for tc in tool_calls
    ]


def run_chat(
    messages: list[dict[str, str]],
    data: GroundedData,
    client: Any | None = None,
    model: str | None = None,
) -> str:
    """Run the tool-calling loop and return the assistant's final reply."""
    client = client or _build_client()
    model = model or settings.openai_model

    convo: list[dict[str, Any]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    convo.extend({"role": m["role"], "content": m["content"]} for m in messages)

    for _ in range(MAX_TOOL_ROUNDS):
        response = client.chat.completions.create(
            model=model, messages=convo, tools=TOOL_SPECS
        )
        message = response.choices[0].message
        tool_calls = getattr(message, "tool_calls", None)

        if not tool_calls:
            return message.content or ""

        convo.append(
            {
                "role": "assistant",
                "content": message.content or "",
                "tool_calls": _normalize_tool_calls(tool_calls),
            }
        )
        for tc in tool_calls:
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            result = data.dispatch(tc.function.name, args)
            convo.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps(result, ensure_ascii=False),
                }
            )

    # Exhausted tool rounds without a plain answer — ask once more, no tools.
    final = client.chat.completions.create(model=model, messages=convo)
    return final.choices[0].message.content or ""
