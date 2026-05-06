from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from redis import Redis


db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

limiter = Limiter(
    key_func=get_remote_address,
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