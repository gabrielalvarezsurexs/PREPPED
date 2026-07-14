"""Grounded assistant: the chat loop reads the user's computed data through
engine-backed tools, and the guardrails live in the system prompt. OpenAI is faked
so the loop runs offline."""

from __future__ import annotations

from datetime import date
from types import SimpleNamespace

import app.api.chat as chat_module
from app.assistant.chat import run_chat
from app.assistant.prompt import SYSTEM_PROMPT, SYSTEM_PROMPT_EN, prompt_for
from app.assistant.tools import GroundedData
from app.engine.trends import MeasurementInput, build_series
from tests.conftest import add_measurement, seed_catalog, seed_profile


def _series() -> list:
    measurements = [
        MeasurementInput(marker_id="glucose_fasting", value=98, date=date(2025, 6, 20)),
        MeasurementInput(marker_id="glucose_fasting", value=118, date=date(2026, 6, 30)),
    ]
    return build_series(measurements)


def _resp(content=None, tool_calls=None):
    message = SimpleNamespace(content=content, tool_calls=tool_calls)
    return SimpleNamespace(choices=[SimpleNamespace(message=message)])


def _tool_call(name: str, arguments: str = "{}", call_id: str = "call_1"):
    return SimpleNamespace(id=call_id, function=SimpleNamespace(name=name, arguments=arguments))


class FakeClient:
    """Scripted OpenAI stand-in exposing ``.chat.completions.create``."""

    def __init__(self, scripted: list):
        self._scripted = scripted
        self.messages_seen: list[list] = []
        self.chat = SimpleNamespace(completions=SimpleNamespace(create=self._create))

    def _create(self, model, messages, tools=None):
        self.messages_seen.append(list(messages))
        return self._scripted.pop(0)


# --- grounding -------------------------------------------------------------

def test_tools_return_engine_computed_values():
    data = GroundedData(_series())

    flags = data.get_flags()["flags"]
    assert flags[0]["marker_id"] == "glucose_fasting"
    assert flags[0]["status"] == "red"  # computed by the engine, not the model

    detail = data.get_marker_detail("glucose_fasting")
    assert detail["reference_range"] == {"low": 70, "high": 99}  # curated table
    assert detail["status"] == "red"
    assert detail["trend"] == "up"
    assert len(detail["points"]) == 2


def test_run_chat_grounds_through_tools():
    data = GroundedData(_series())
    client = FakeClient(
        [
            _resp(tool_calls=[_tool_call("get_flags")]),
            _resp(content="Tu glucosa viene subiendo; vale la pena comentarlo con tu médico."),
        ]
    )

    reply = run_chat(
        [{"role": "user", "content": "¿Cómo van mis resultados?"}],
        data,
        client=client,
        model="test-model",
    )

    assert "médico" in reply
    # The second model call was fed a grounded tool result from our engine.
    second_call = client.messages_seen[1]
    tool_messages = [m for m in second_call if m.get("role") == "tool"]
    assert any("glucose_fasting" in m["content"] for m in tool_messages)


# --- guardrails ------------------------------------------------------------

def test_system_prompt_keeps_hard_guardrails():
    prompt = SYSTEM_PROMPT.lower()
    assert "no diagnostiques" in prompt
    assert "nunca inventes" in prompt
    assert "dosis" in prompt
    assert "profesional de salud" in prompt


def test_english_prompt_keeps_hard_guardrails():
    assert prompt_for("en") is SYSTEM_PROMPT_EN
    prompt = SYSTEM_PROMPT_EN.lower()
    assert "do not diagnose" in prompt
    assert "never invent" in prompt
    assert "dosing" in prompt
    assert "health professional" in prompt
    # Unknown languages fall back to Spanish.
    assert prompt_for("fr") is SYSTEM_PROMPT


# --- route wiring ----------------------------------------------------------

def test_chat_route_returns_reply_and_disclaimer(client, session, monkeypatch):
    seed_catalog(session)
    profile = seed_profile(session)
    add_measurement(session, profile.id, "glucose_fasting", 118, date(2026, 6, 30))

    monkeypatch.setattr(
        chat_module, "run_chat", lambda messages, data, lang="es": "Respuesta de prueba."
    )

    resp = client.post("/api/chat", json={"messages": [{"role": "user", "content": "hola"}]})
    assert resp.status_code == 200
    body = resp.json()
    assert body["reply"] == "Respuesta de prueba."
    assert "profesional de salud" in body["disclaimer"].lower()


def test_chat_route_passes_selected_language(client, session, monkeypatch):
    seed_catalog(session)
    profile = seed_profile(session)
    add_measurement(session, profile.id, "glucose_fasting", 118, date(2026, 6, 30))

    seen: dict = {}

    def _fake(messages, data, lang="es"):
        seen["lang"] = lang
        return "Test reply."

    monkeypatch.setattr(chat_module, "run_chat", _fake)

    resp = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "hi"}], "lang": "en"},
    )
    assert resp.status_code == 200
    assert seen["lang"] == "en"


def test_chat_route_rejects_empty_conversation(client, session):
    seed_catalog(session)
    seed_profile(session)
    resp = client.post("/api/chat", json={"messages": []})
    assert resp.status_code == 400
