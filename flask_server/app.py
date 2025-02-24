from flask import Flask, jsonify, send_from_directory
from api import api  # Import the API instance
from flask_cors import CORS
from flask_jwt_extended import JWTManager

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "sehan_secret_key123"
jwt = JWTManager(app)
app.url_map.strict_slashes = False

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


@app.route("/api/files/<student_id>/<filename>", methods=["GET"])
def get_file(student_id, filename):
    directory = f"./uploads/{student_id}"
    return send_from_directory(directory, filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
