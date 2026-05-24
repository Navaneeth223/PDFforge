from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import os
import tempfile
import json

class Settings(BaseSettings):
    # API
    SECRET_KEY: str = "docxio-dev-secret-key"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Files
    TEMP_DIR: str = os.path.join(tempfile.gettempdir(), "docxio")
    MAX_FILE_SIZE_MB: int = 100
    FILE_RETENTION_MINUTES: int = 60

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        """Accept a JSON array string OR a comma-separated string from env vars."""
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                return json.loads(v)
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @property
    def redis_url(self) -> str:
        return self.REDIS_URL

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
