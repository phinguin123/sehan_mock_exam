# api/hello.py
from flask_restx import Namespace, Resource

hello_ns = Namespace("hello", description="Hello World operations")


@hello_ns.route("/")
class HelloWorld(Resource):
    def get(self):
        return {"message": "Hello, world!"}
