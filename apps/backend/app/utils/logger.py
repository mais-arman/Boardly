import logging
import sys

def configure_logging(app):

    log_level = app.config.get("LOG_LEVEL", "INFO").upper()

    handler = logging.StreamHandler(sys.stdout)

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )

    handler.setFormatter(formatter)

    app.logger.handlers.clear()
    app.logger.addHandler(handler)
    app.logger.setLevel(getattr(logging, log_level, logging.INFO))

    app.logger.info("Logging system initialized")