from pydantic_settings import BaseSettings
from typing import List
import os
import tempfile

class Settings(BaseSettings):
    # API
    SECRET_KEY: str = "docxio-dev-secret-key"
    # Stored as a raw comma-separated string to avoid pydantic-settings v2
    # attempting json.loads() on the value before any validator can intercept it.
    # Use the `allowed_origins` property to get the parsed list.
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Files
    TEMP_DIR: str = os.path.join(tempfile.gettempdir(), "docxio")
    MAX_FILE_SIZE_MB: int = 100
    FILE_RETENTION_MINUTES: int = 60

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    @property
    def allowed_origins(self) -> List[str]:
        """Parse comma-separated ALLOWED_ORIGINS into a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def redis_url(self) -> str:
        return self.REDIS_URL

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

