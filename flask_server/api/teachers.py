from flask_restx import Namespace, Resource, fields
from flask import Flask
from db import DBHelper

# Initialize Flask app and namespace
app = Flask(__name__)
teachers_ns = Namespace("teachers", description="Teacher-related operations")

# Define the teacher model
teacher_model = teachers_ns.model(
    "Teacher",
    {
        "id": fields.Integer(description="Teacher ID", required=True, example=1),
        "name": fields.String(
            description="Name of the teacher", required=True, example="John Doe"
        ),
        "email": fields.String(
            description="Email of the teacher", required=True, example="asdf@gmail.com"
        ),
    },
)

db_helper = DBHelper()


# Create a resource to expose the model
@teachers_ns.route("/")
class Teachers(Resource):
    @teachers_ns.marshal_list_with(teacher_model)
    def get(self):
        """Get list of all teachers"""
        sql = """
        SELECT * from teachers
        """
        teachers_data = db_helper.fetch_all(sql)

        return teachers_data, 200

    @teachers_ns.expect(teacher_model)
    @teachers_ns.marshal_with(teacher_model, code=201)
    def post(self):
        """Add a new teacher"""
        new_teacher = teachers_ns.payload
        name = new_teacher["name"]
        email = new_teacher["email"]

        sql = "INSERT INTO teachers (name, email) VALUES (%s, %s)"
        teacher_id = db_helper.execute(sql, (name, email))

        new_teacher["id"] = teacher_id

        return new_teacher, 201


@teachers_ns.route("/<int:teacher_id>")
class Teachers(Resource):
    @teachers_ns.expect(teacher_model)
    @teachers_ns.marshal_with(teacher_model)
    def put(self, teacher_id):
        """Update an existing teacher"""
        new_teacher = teachers_ns.payload
        name = new_teacher["name"]
        email = new_teacher["email"]

        sql_update = """
            UPDATE teachers
            SET name = %s, email = %s
            WHERE id = %s
        """
        teacher = db_helper.execute(sql_update, (name, email, teacher_id))

        if teacher is None:
            teachers_ns.abort(404, "Teacher not found")

        new_teacher["id"] = teacher_id

        return new_teacher, 200

    @teachers_ns.response(204, "Teacher successfully deleted")
    def delete(self, teacher_id):
        """Delete a specific teacher"""
        # Delete teacher data from the database
        sql = "DELETE FROM teachers WHERE id = %s"
        db_helper.execute(sql, (teacher_id,))

        return None, 204
