"""Application settings, loaded from environment / .env.

The .env file lives at the repository root (one level above ``backend/``).
Secrets (OPENAI_API_KEY) are never committed; see ``.env.example``.
"""

from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Repo root = two levels up from this file (backend/app/config.py -> repo/).
REPO_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Runtime configuration for the backend."""

    model_config = SettingsConfigDict(
        env_file=(REPO_ROOT / ".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    database_url: str = "sqlite:///./prepped.db"

    # Comma-separated list of allowed frontend origins.
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def llm_configured(self) -> bool:
        """True when a real OpenAI key is present (extraction can call the model)."""
        return bool(self.openai_api_key.strip())


settings = Settings()
