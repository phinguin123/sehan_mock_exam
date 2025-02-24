# api/__init__.py
from flask_restx import Api
from .hello import hello_ns  # Importing the namespace
from .exams import exams_ns
from .exams import submissions_ns
from .students import students_ns
from .subjects import subjects_ns
from .grades import grades_ns
from .auth import Auth
from .files import files_ns
from .comments import comments_ns
from .teachers import teachers_ns
from .reports import reports_ns

api = Api(
    title="Sehan Mock Exam API",
    version="1.0",
    description="An API for mock exams",
    contact="koysr20@gmail.com",
    license="MIT",
)

# Register namespaces
api.add_namespace(hello_ns, "/api/hello")
api.add_namespace(exams_ns, "/api/exams")
api.add_namespace(submissions_ns, "/api/exam-submissions")
api.add_namespace(students_ns, "/api/students")
api.add_namespace(subjects_ns, "/api/subjects")
api.add_namespace(grades_ns, "/api/grades")
api.add_namespace(Auth, "/api/auth")
api.add_namespace(files_ns, "/api/files")
api.add_namespace(comments_ns, "/api/comments")
api.add_namespace(teachers_ns, "/api/teachers")
api.add_namespace(reports_ns, "/api/reports")