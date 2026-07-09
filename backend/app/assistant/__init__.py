"""Grounded chat assistant — the LLM's verbalization role, extended to Q&A.

The assistant answers ONLY from the user's own computed data, which it reads through
deterministic, engine-backed tools (tool-calling). It may add light, general-purpose
insight and context, but it never computes a classification, invents a reference
range, diagnoses, or prescribes. All numbers/statuses/trends still come from
``app.engine``; the model only reads and explains them.

This package may call ``openai`` (it is a verbalization surface, not the engine). The
hard boundary guarded by ``tests/test_boundary.py`` is specifically that ``app.engine``
never touches the model.
"""
