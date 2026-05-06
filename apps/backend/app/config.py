import os
from dotenv import load_dotenv

load_dotenv()

APP_ENV = os.getenv("APP_ENV", "development")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class BaseConfig:
    APP_ENV = APP_ENV
    REDIS_URL = REDIS_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    if not JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY is not set")

    RATELIMIT_STORAGE_URI = REDIS_URL


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    LOG_LEVEL = os.getenv("LOG_LEVEL", "DEBUG")


class ProductionConfig(BaseConfig):
    DEBUG = False
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")


config_by_env = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}

Config = config_by_env.get(APP_ENV, DevelopmentConfig)