from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Default to SQLite for zero-config local running; Docker .env can override with postgresql
    DATABASE_URL: str = "sqlite+aiosqlite:///./siem.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    OPENAI_API_KEY: str = ""
    VIRUSTOTAL_API_KEY: str = ""
    ABUSEIPDB_API_KEY: str = ""
    SHODAN_API_KEY: str = ""

    SIEM_PLATFORM: str = "real"
    SIEM_URL: str = ""
    SIEM_USERNAME: str = ""
    SIEM_PASSWORD: str = ""
    SIEM_API_TOKEN: str = ""

    USE_MOCK_DATA: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()