from flask import jsonify

def success_response(data=None, message="Success", status_code=200, meta=None):
    response = {
        "success": True,
        "message": message,
        "data": data,
    }

    if meta is not None:
        response["meta"] = meta

    return jsonify(response), status_code


def error_response(
    message="Something went wrong",
    status_code=500,
    error="Error",
    errors=None,
):
    response = {
        "success": False,
        "error": error,
        "message": message,
    }

    if errors is not None:
        response["errors"] = errors

    return jsonify(response), status_code