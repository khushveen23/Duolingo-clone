import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Duolingo Clone API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'duolingo.db'}")
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
