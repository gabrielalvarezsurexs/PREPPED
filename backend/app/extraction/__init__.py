"""LLM extraction — the ONLY place in the codebase that calls the model.

The model does exactly one job here: read a PDF/photo and return structured
measurements. It never classifies, trends, or judges. Downstream, the deterministic
engine takes over. Keep this boundary hard (see ``tests/test_boundary.py``).
"""
