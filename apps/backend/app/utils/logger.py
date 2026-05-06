import json
import logging
from flask import has_request_context, request

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        if has_request_context():
            log_record.update({
                "path": request.path,
                "method": request.method,
                "remote_addr": request.remote_addr,
            })

        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_record)


def configure_logging(app):
    log_level = app.config.get("LOG_LEVEL", "INFO")

    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())

    app.logger.handlers.clear()
    app.logger.addHandler(handler)
    app.logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    app.logger.info("Logging system initialized")