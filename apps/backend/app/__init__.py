from flask import Flask
from app.config import Config
from app.extensions import db, migrate, jwt, limiter, init_redis
from app.utils.error_handlers import register_error_handlers
from app.utils.logger import configure_logging


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    configure_logging(app)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    limiter.init_app(app)
    init_redis(app)

    from app import models
    from app.utils import jwt_handlers

    from app.routes.auth_routes import auth_bp
    from app.routes.board_routes import board_bp
    from app.routes.list_routes import list_bp
    from app.routes.card_routes import card_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(board_bp, url_prefix="/api/boards")
    app.register_blueprint(list_bp, url_prefix="/api")
    app.register_blueprint(card_bp, url_prefix="/api")

    register_error_handlers(app)

    app.logger.info("Boardly backend started successfully")

    return app