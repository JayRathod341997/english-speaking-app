from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/english_app"

    class Config:
        env_file = ".env"


settings = Settings()
