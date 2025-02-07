# api/exams.py
from flask_restx import Namespace, Resource, fields, reqparse
from werkzeug.datastructures import FileStorage

exams_ns = Namespace("exams", description="Exam-related operations")
submissions_ns = Namespace("exam-submissions", description="Exam submission operations")

submit_exam_parser = reqparse.RequestParser()
submit_exam_parser.add_argument(
    "exam_id", type=int, required=True, help="Exam ID is required"
)
submit_exam_parser.add_argument(
    "student_id", type=int, required=True, help="Student ID is required"
)
submit_exam_parser.add_argument(
    "file",
    type=FileStorage,
    location="files",
    required=True,
    help="Exam file is required",
)


# fmt: off
exam_model = exams_ns.model(
    "Exam",
    {
        "id": fields.Integer(
            description="Exam ID", required=True, example=1
        ),
        "title": fields.String(
            description="Exam name", required=True, example="Math Exam"
        ),
        "subject": fields.String(
            description="Subject name", required=True, example="Math"
        ),
        "grade": fields.String(
            description="Grade for the exam", required=True, example="pre-IB or 11"
        ),
    },
)

# Exam Submission Model
exam_submission_model = submissions_ns.model(
    "ExamSubmission",
    {
        "id": fields.Integer(
            description="Submission ID", required=True, example=101
        ),
        "exam_id": fields.Integer(
            description="ID of the submitted exam", required=True, example=1
        ),
        "student_id": fields.Integer(
            description="ID of the student", required=True, example=123
        ),
        "file": fields.Raw(
            description="Student file", example="filename.pdf"
        ),
    },
)


# fmt: on

# Dummy Data
exams = [
    {"id": 1, "title": "Math Exam", "subject": "Math", "grade": "pre-IB or 11"},
    {"id": 2, "title": "Science Exam", "subject": "Science", "grade": "10"},
]

exam_submissions = []


@exams_ns.route("/")
class Exams(Resource):
    @exams_ns.marshal_list_with(exam_model)
    def get(self):
        """Get list of all created exams"""
        return exams, 200

    @exams_ns.expect(exam_model)
    @exams_ns.marshal_with(exam_model, code=201)
    def post(self):
        """Create a new exam (Admin Only)"""
        new_exam = exams_ns.payload
        new_exam["id"] = len(exams) + 1  # Generate ID
        exams.append(new_exam)
        return new_exam, 201


@exams_ns.route("/<int:exam_id>")
@exams_ns.response(404, "Exam not found")
class Exam(Resource):
    @exams_ns.marshal_with(exam_model)
    def get(self, exam_id):
        """Get details of a specific exam"""
        exam = next((e for e in exams if e["id"] == exam_id), None)
        if not exam:
            exams_ns.abort(404, "Exam not found")
        return exam, 200


@submissions_ns.route("/")
class ExamSubmissions(Resource):
    @submissions_ns.marshal_list_with(exam_submission_model)
    def get(self):
        """Get all submitted exams (For Admins)"""
        return exam_submissions, 200

    @submissions_ns.expect(exam_submission_model)
    @submissions_ns.marshal_with(exam_submission_model, code=201)
    def post(self):
        """Submit an exam (For Students)"""
        args = submit_exam_parser.parse_args()
        exam_id = args["exam_id"]
        student_id = args["student_id"]
        file = args["file"]
        file.save(f"./uploads/{file.filename}")

        new_submission = {
            "exam_id": exam_id,
            "student_id": student_id,
            "filename": file.filename,
        }

        return new_submission, 201


@submissions_ns.route("/<int:submission_id>")
@submissions_ns.response(404, "Submission not found")
class ExamSubmission(Resource):
    @submissions_ns.marshal_with(exam_submission_model)
    def get(self, submission_id):
        """Get details of a specific submitted exam"""
        submission = next(
            (s for s in exam_submissions if s["id"] == submission_id), None
        )
        if not submission:
            submissions_ns.abort(404, "Submission not found")
        return submission, 200
