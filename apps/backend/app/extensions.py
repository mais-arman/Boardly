from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
from flask_socketio import SocketIO
from redis import Redis


db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()

socketio = SocketIO(
    cors_allowed_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://18.207.113.226",
        "http://18.207.113.226:5173",
    ],
    async_mode="eventlet",
)

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per minute"],
)

redis_client = None


def init_redis(app):
    global redis_client

    redis_client = Redis.from_url(
        app.config["REDIS_URL"],
        decode_responses=True,
    )

    redis_client.ping()


def get_redis():
    if redis_client is None:
        raise RuntimeError("Redis client is not initialized")

    return redis_client