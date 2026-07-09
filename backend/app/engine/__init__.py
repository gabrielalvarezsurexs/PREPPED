"""Deterministic health engine.

Everything here is pure, testable, and computed by OUR code. This package MUST NOT
import ``app.extraction`` or ``openai`` — the model never judges a result. That
boundary is enforced by ``tests/test_boundary.py``.
"""
