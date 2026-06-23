from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    anthropic_api_key: str = ""
    claude_model: str = "claude-opus-4-8"
    force_mock_claude: bool = False

    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    database_url: str = "sqlite:///./genuix.db"

    # ✅ ADD SUPABASE (this fixes your error)
    supabase_url: str = ""
    supabase_key: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()