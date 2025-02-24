from flask_restx import Namespace, Resource, fields
from db import DBHelper

grades_ns = Namespace("grades", description="Grade-related operations")

# Subject Model
grade_model = grades_ns.model(
    "Grade",
    {
        "id": fields.Integer(description="Grade ID", required=True, example=1),
        "grade_name": fields.String(
            description="Grade name", required=True, example="pre-IB"
        ),
    },
)

# Dummy Data
# subjects = [
#     {"id": 1, "subject_name": "Math"},
#     {"id": 2, "subject_name": "Science"},
#     {"id": 3, "subject_name": "History"},
# ]

db_helper = DBHelper()


@grades_ns.route("/")
class Grades(Resource):
    @grades_ns.marshal_list_with(grade_model)
    def get(self):
        """Get list of all grades"""

        sql = "SELECT * FROM grades"
        grades = db_helper.fetch_all(sql)

        return grades, 200

    # @grades_ns.expect(grade_model)
    # @grades_ns.marshal_with(grade_model, code=201)
    # def post(self):
    #     """Add a new subject (Admin Only)"""
    #     new_grade = grades_ns.payload

    #     return new_grade, 201


# @grades_ns.route("/<int:subject_id>")
# @grades_ns.response(404, "Subject not found")
# class Subject(Resource):
#     @grades_ns.marshal_with(subject_model)
#     def get(self, subject_id):
#         """Get details of a specific subject"""
#         subject = next((s for s in subjects if s["id"] == subject_id), None)
#         if not subject:
#             grades_ns.abort(404, "Subject not found")
#         return subject, 200
