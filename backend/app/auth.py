"""Password hashing for the prototype auth (stdlib only, no new dependencies).

A profile's ``password_hash`` is stored as ``pbkdf2_sha256$<iter>$<salt_hex>$<hash_hex>``.
This is deliberately prototype-grade: enough to not store plaintext, paired with a
spoofable ``X-Profile-Id`` header for identity. Real tokens/sessions are out of scope
for this testing stage.

This module lives OUTSIDE ``app/engine`` so it never crosses the engine boundary.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets

_ALGORITHM = "pbkdf2_sha256"
_ITERATIONS = 200_000
_SALT_BYTES = 16


def hash_password(raw: str, *, iterations: int = _ITERATIONS) -> str:
    """Return a self-describing pbkdf2 digest for ``raw``."""
    salt = secrets.token_bytes(_SALT_BYTES)
    digest = hashlib.pbkdf2_hmac("sha256", raw.encode("utf-8"), salt, iterations)
    return f"{_ALGORITHM}${iterations}${salt.hex()}${digest.hex()}"


def verify_password(raw: str, stored: str) -> bool:
    """Constant-time check of ``raw`` against a stored ``hash_password`` digest."""
    try:
        algorithm, iter_str, salt_hex, digest_hex = stored.split("$")
        if algorithm != _ALGORITHM:
            return False
        iterations = int(iter_str)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
    except (ValueError, AttributeError):
        return False

    candidate = hashlib.pbkdf2_hmac("sha256", raw.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(candidate, expected)
