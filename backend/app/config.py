import os
import shutil
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


def get_database_url() -> str:
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        return env_url

    # In Vercel or serverless environments, only /tmp is writable.
    is_vercel = bool(os.getenv("VERCEL") or os.getenv("VERCEL_ENV") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
    has_unix_tmp = os.path.isdir("/tmp") and os.name != "nt"

    if is_vercel or has_unix_tmp:
        tmp_db_path = Path("/tmp/duolingo.db")
        local_db = BASE_DIR / "duolingo.db"
        # If /tmp/duolingo.db doesn't exist yet but bundled duolingo.db exists, copy it over
        if not tmp_db_path.exists() and local_db.exists():
            try:
                shutil.copy2(local_db, tmp_db_path)
            except Exception:
                pass
        return f"sqlite:///{tmp_db_path.as_posix()}"

    return f"sqlite:///{BASE_DIR / 'duolingo.db'}"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Duolingo Clone API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = get_database_url()
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    MAX_HEARTS: int = 5
    HEART_REGEN_MINUTES: int = 30
    DEFAULT_DAILY_GOAL_XP: int = 20
    DEFAULT_USER_ID: int = 1

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
