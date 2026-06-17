from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str
<<<<<<< HEAD
    # Comma-separated list of allowed CORS origins (frontend URLs).
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://172.23.144.180:5174,http://localhost:8000,https://localhost,capacitor://localhost,http://localhost"
=======
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:5174,http://127.0.0.1:5174,http://172.23.144.180:5174,http://172.23.144.180:5173"
>>>>>>> cd01cef8967bcef1961b9e78d07cfc25c420c64d

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
