import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    ENV = os.getenv("FLASK_ENV")
    DEBUG = ENV == "development"
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")