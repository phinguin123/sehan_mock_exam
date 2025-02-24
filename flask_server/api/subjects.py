from flask_restx import Namespace, Resource, fields
from db import DBHelper

subjects_ns = Namespace("subjects", description="Subject-related operations")

# Subject Model
subject_model = subjects_ns.model(
    "Subject",
    {
        "id": fields.Integer(description="Subject ID", required=True, example=1),
        "subject_name": fields.String(
            description="Subject name", required=True, example="Math"
        ),
    },
)

# Dummy Data
subjects = [
    {"id": 1, "subject_name": "Math"},
    {"id": 2, "subject_name": "Science"},
    {"id": 3, "subject_name": "History"},
]

db_helper = DBHelper()


@subjects_ns.route("/")
class Subjects(Resource):
    @subjects_ns.marshal_list_with(subject_model)
    def get(self):
        """Get list of all subjects"""

        sql = "SELECT * FROM subjects"
        subjects = db_helper.fetch_all(sql)

        return subjects, 200

    @subjects_ns.expect(subject_model)
    @subjects_ns.marshal_with(subject_model, code=201)
    def post(self):
        """Add a new subject (Admin Only)"""
        new_subject = subjects_ns.payload
        new_subject["id"] = len(subjects) + 1  # Auto-generate ID
        subjects.append(new_subject)
        return new_subject, 201


@subjects_ns.route("/<int:subject_id>")
@subjects_ns.response(404, "Subject not found")
class Subject(Resource):
    @subjects_ns.marshal_with(subject_model)
    def get(self, subject_id):
        """Get details of a specific subject"""
        subject = next((s for s in subjects if s["id"] == subject_id), None)
        if not subject:
            subjects_ns.abort(404, "Subject not found")
        return subject, 200
