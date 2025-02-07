from flask import Flask, jsonify
from api import api  # Import the API instance

app = Flask(__name__)
api.init_app(app)


# GET request to retrieve all exaSms
@app.route("/api/exams", methods=["GET"])
def get_exams():
    return "api"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
