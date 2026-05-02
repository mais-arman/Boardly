from flask import Flask

app = Flask(__name__)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
    }, 200