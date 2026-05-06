import os
from dotenv import load_dotenv

load_dotenv()

APP_ENV = os.getenv("APP_ENV", "development")

class BaseConfig:
    APP_ENV = APP_ENV
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    RATELIMIT_STORAGE_URI = REDIS_URL

    if not SQLALCHEMY_DATABASE_URI:
        raise RuntimeError("DATABASE_URL is not set")

    if not JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY is not set")


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    LOG_LEVEL = os.getenv("LOG_LEVEL", "DEBUG")


class ProductionConfig(BaseConfig):
    DEBUG = False
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")


class TestingConfig(BaseConfig):
    TESTING = True
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv("TEST_DATABASE_URL")


config_by_env = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}

if APP_ENV not in config_by_env:
    raise RuntimeError(f"Unknown APP_ENV: {APP_ENV}")

Config = config_by_env[APP_ENV]