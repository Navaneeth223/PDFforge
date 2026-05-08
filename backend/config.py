from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    max_file_size_mb: int = 100
    file_retention_minutes: int = 60
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    allowed_origins: str = "http://localhost:3000"
    secret_key: str = "super-secret-key-change-in-production"

    @property
    def get_allowed_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"

settings = Settings()
