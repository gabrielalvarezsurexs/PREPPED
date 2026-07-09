"""The hard seam: the deterministic engine must never call the model.

Statically assert that no module under ``app/engine`` imports an LLM-facing package
(extraction, assistant) or the OpenAI SDK. If this test fails, health logic has leaked
toward the model.
"""

from __future__ import annotations

import ast
from pathlib import Path

ENGINE_DIR = Path(__file__).resolve().parents[1] / "app" / "engine"

FORBIDDEN_PREFIXES = ("app.extraction", "app.assistant", "openai")


def _imported_modules(source: str) -> set[str]:
    tree = ast.parse(source)
    names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            names.update(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            names.add(node.module)
    return names


def test_engine_never_imports_extraction_or_openai():
    offenders: list[str] = []
    for py_file in ENGINE_DIR.glob("*.py"):
        imports = _imported_modules(py_file.read_text(encoding="utf-8"))
        for imported in imports:
            if imported.startswith(FORBIDDEN_PREFIXES):
                offenders.append(f"{py_file.name} imports {imported}")
    assert not offenders, "Engine crossed the LLM boundary:\n" + "\n".join(offenders)
