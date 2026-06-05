import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Resume & Interview Copilot MVP"
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "ai_resume_copilot"
    OPENAI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
