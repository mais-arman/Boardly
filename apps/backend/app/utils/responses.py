def success_response(data=None, message="Success", status_code=200, meta=None):
    response = {
        "success": True,
        "message": message,
        "data": data,
        "meta": meta
    }
    return response, status_code


def error_response(message="Something went wrong", status_code=500, errors=None):
    response = {
        "success": False,
        "message": message,
        "errors": errors
    }
    return response, status_code