from flask import Flask
from app.config import Config
from app.extensions import db, migrate
from app.utils.error_handlers import register_error_handlers
from app.utils.logger import configure_logging


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    configure_logging(app)

    db.init_app(app)
    migrate.init_app(app, db)

    from app import models

    register_error_handlers(app)

    app.logger.info("Boardly backend started successfully")

    return app