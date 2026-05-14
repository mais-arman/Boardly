from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.constants.routes import AUTH_PREFIX, BOARDS_PREFIX, API_PREFIX
from app.extensions import db, migrate, jwt, limiter, mail, init_redis, socketio
from app.utils.error_handlers import register_error_handlers
from app.utils.logger import configure_logging
from app.constants.routes import AUTH_PREFIX, BOARDS_PREFIX, API_PREFIX, ADMIN_PREFIX


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://18.207.113.226:5173",
                ],
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
    )

    configure_logging(app)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    limiter.init_app(app)
    mail.init_app(app)
    init_redis(app)

    socketio.init_app(app)

    from app import models
    from app.utils import jwt_handlers

    from app.routes.auth.auth_routes import auth_bp
    from app.routes.boards.board_routes import board_bp
    from app.routes.boards.invitation_routes import invitation_bp
    from app.routes.lists.list_routes import list_bp
    from app.routes.cards.card_routes import card_bp
    from app.routes.cards.assignee_routes import assignee_bp
    from app.routes.cards.label_routes import label_bp
    from app.routes.cards.comment_routes import comment_bp
    from app.routes import socket_routes
    from app.routes.admin.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix=AUTH_PREFIX)
    app.register_blueprint(board_bp, url_prefix=BOARDS_PREFIX)
    app.register_blueprint(invitation_bp, url_prefix=API_PREFIX)
    app.register_blueprint(list_bp, url_prefix=API_PREFIX)
    app.register_blueprint(card_bp, url_prefix=API_PREFIX)
    app.register_blueprint(assignee_bp, url_prefix=API_PREFIX)
    app.register_blueprint(label_bp, url_prefix=API_PREFIX)
    app.register_blueprint(comment_bp, url_prefix=API_PREFIX)
    app.register_blueprint(admin_bp, url_prefix=ADMIN_PREFIX)

    register_error_handlers(app)

    app.logger.info("Boardly backend started successfully")

    return app