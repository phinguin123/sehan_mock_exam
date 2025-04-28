from flask import Flask


app = Flask(__name__)

from werkzeug.debug import DebuggedApplication

app.wsgi_app = DebuggedApplication(app.wsgi_app, evalex=True)


@app.route("/")
def home():
    return "Hello World"


@app.route("/crash")
def crash():
    # Intentionally cause an error
    return 1 / 0


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
