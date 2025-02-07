# api/__init__.py
from flask_restx import Api
from .hello import hello_ns  # Importing the namespace
from .exams import exams_ns  # You can import multiple namespaces

api = Api(
    title="Sehan Mock Exam API",
    version="1.0",
    description="An API for mock exams",
    contact="koysr20@gmail.com",
    license="MIT",
)

# Register namespaces
api.add_namespace(hello_ns, "/hello")
api.add_namespace(exams_ns, "/exams")  # Example of multiple namespaces
