from flask import Flask, jsonify, send_from_directory, request
from api import api  # Import the API instance
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import datetime
import logging
from werkzeug.exceptions import BadRequest, HTTPException, BadRequestKeyError
from jwt.exceptions import ExpiredSignatureError


logging.basicConfig(filename="logs/server.log", level=logging.DEBUG, filemode="a")

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "sehan_secret_key123"
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # 100MB limit
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 600
app.config["PROPAGATE_EXCEPTIONS"] = True
app.url_map.strict_slashes = False

jwt = JWTManager(app)

api.init_app(app)

CORS(
    app,
    supports_credentials=True,
    resources={
        r"*": {
            "origins": [
                "https://www.sehanibexam.com",
                "https://dev.sehanibexam.com",
                "https://sehanibexam.com",
                "http://13.124.129.238:5173",
            ]
        }
    },
)


# GET request to retrieve all exaSms
@app.route("/api/exams", methods=["GET"])
def get_exams():
    return "api"


@app.route("/api/error", methods=["GET"])
def make_error():
    3 / 0
    return "hello"


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"message": "Token has expired"}), 401


# Catch JWT-related exceptions globally
@app.errorhandler(ExpiredSignatureError)
def handle_expired_signature_error(e):
    print("expired token signature")
    logging.error(f"[ERROR!] {request.method} {request.path} - {str(e)}", exc_info=True)
    return jsonify({"message": "Token has expired"}), 401


@app.route("/secret-log")
def show_secret_log():
    # app.logger.info(f'[{request.method}] {request.path}')
    app.logger.info("info level dubug info!!!")
    app.logger.debug("debug level dubug info!!!")
    print("logging.............")
    return jsonify({"message": "Logging test completed! Check logs/server.log."})


# # Log every request (before request runs)
# @app.before_request
# def log_request():
#     logging.info(f"[REQUEST] {request.method} {request.path} from {request.remote_addr}")

# @app.errorhandler(400)
# def handle_exception(e):
#     print("inside errorhandler")
#     logging.error(f"[ERROR] {request.method} {request.path} - {str(e)}", exc_info=True)
#     return jsonify(message=str(e)), 400


# ✅ Catch all exceptions, including Flask-RESTX ones
@app.errorhandler(Exception)
def handle_general_exception(e):
    """Catch-all error handler for unexpected exceptions."""
    logging.error(f"[ERROR!] {request.method} {request.path} - {str(e)}", exc_info=True)

    return {"message": "An unexpected error occurred. Please try again later."}, 400


#     print("Exception occurrrring", e)
#     # Avoid triggering a second response if Flask-RESTX has already handled it
#     if hasattr(e, 'response'):
#         print("has attribute")
#         # This means Flask-RESTX has already handled the error and returned a response
#         return e.response


#     # If it's an HTTPException (like BadRequest, NotFound), use its status code
#     if isinstance(e, HTTPException):
#         return jsonify(message=e.description), e.code

#     if isinstance(e, ExpiredSignatureError):
#         print("token expired getting executed")
#         return jsonify(msg="Token has expired"), 401

#     # Otherwise, return a generic 500 error
#     return jsonify(message="Internal Server Error!"), 500


@api.errorhandler(Exception)
def handle_api_exception(e):
    logging.error(f"[ERROR!] {request.method} {request.path} - {str(e)}", exc_info=True)

    print("Exception occurrrring 222", e)

    # Only return JSON for exceptions that are HTTPExceptions
    if isinstance(e, BadRequest):
        return {"message": str(e)}, e.code
        # return jsonify(message=str(e)), 400

    if isinstance(e, ExpiredSignatureError):
        print("token expired getting executed")
        return {"message": "Token has expired"}, 401
    return {"message": str(e)}
    return jsonify(message="Internal Server Error"), 500


# @app.errorhandler
# def handle_exception_3(e):
#     print("inside errorhandler")
#     logging.error(f"[ERROR] {request.method} {request.path} - {str(e)}", exc_info=True)
#     return jsonify(message=str(e)), 500


# @app.route("/api/files/<student_id>/<filename>", methods=["GET"])
# def get_file(student_id, filename):
#     directory = f"./uploads/{student_id}"
#     return send_from_directory(directory, filename)


if __name__ == "__main__":
    print("this is getting executed")
    app.run(host="0.0.0.0", port=5001, debug=True)
