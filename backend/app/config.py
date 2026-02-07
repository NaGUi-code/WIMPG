from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    AIRLABS_API_KEY: str = ""
    USE_FIXTURES: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
