from flask_restx import Namespace, Resource, fields, reqparse, abort
from db import DBHelper
from .subjects import subject_model
from utils.utils import get_grade_id, get_subject_id
from flask_jwt_extended import get_jwt_identity, jwt_required


students_ns = Namespace("students", description="Student-related operations")

resource_parser = reqparse.RequestParser()
resource_parser.add_argument(
    "Authorization",
    help="Bearer {access_token}",
    type=str,
    required=True,
    location="headers",
    default="Bearer ",
)

# fmt: off
student_model = students_ns.model(
    "Student",
    {
        "id": fields.Integer(
            description="Student ID", required=False, example=1
        ),
        "name": fields.String(
            description="Name of the student", required=True, example="홍길동"
        ),
        "school": fields.String(
            description="School of the student", required=True, example="서울대학교"
        ),
        "grade": fields.String(
            description="Grade of the student", required=True, example="pre-IB"
        ),
        "email": fields.String(
            description="Email of the student (must be unique)", required=True, example="asdf@gmail.com"
        ),
        "phone_number": fields.String(
            description="Kakaotalk phone number of the parent(with country code)",
            required=True,
            example="821099999999",
        ),
        "subjects": fields.List(fields.Nested(subject_model), description="List of subjects the student is taking"),
    },
)


# Model for retrieving a student's profile (only some fields)
student_profile_model = students_ns.model(
    "StudentProfile",
    {
        "id": fields.Integer(description="Student ID", example=1),
        "name": fields.String(description="Name of the student", example="홍길동"),
        "school": fields.String(description="School of the student", example="서울대학교"),
        "grade": fields.String(description="Grade of the student", example="pre-IB"),
    },
)

# fmt: on
# Dummy Data for Students
students = [
    {
        "id": 1,
        "name": "John Doe",
        "grade": "10th",
        "school": "Green Valley High",
        "phone_number": "123-456-7890",
        "subjects": ["Math", "Science"],
    },
]

db_helper = DBHelper()


@students_ns.route("/")
class Students(Resource):
    @students_ns.marshal_list_with(student_model)
    def get(self):
        """Get list of all students"""
        sql = """
        SELECT s.id, s.name, s.school, s.phone_number, s.email, g.grade_name as grade
        FROM students s
        JOIN grades g ON s.grade_id = g.id
        ORDER BY s.name
        """
        students_data = db_helper.fetch_all(sql)

        formatted_students = []

        for student in students_data:
            # For each student, fetch the associated subjects
            sql_subjects = """
                SELECT s.id, s.subject_name 
                FROM subjects s
                JOIN student_subjects ss ON ss.subject_id = s.id
                WHERE ss.student_id = %s
            """
            subjects_data = db_helper.fetch_all(sql_subjects, (student["id"],))

            # Format the subjects as a list of dictionaries
            subjects = [
                {"id": subject["id"], "subject_name": subject["subject_name"]}
                for subject in subjects_data
            ]

            # Add the subjects to the student data
            student["subjects"] = subjects

            # Append the formatted student to the list
            formatted_students.append(student)

        return formatted_students, 200

    @students_ns.expect(student_model)
    # @students_ns.marshal_with(student_model, code=201)
    def post(self):
        """Add a new student"""
        new_student = students_ns.payload
        name = new_student["name"]
        school = new_student["school"]
        email = new_student["email"]
        phone_number = new_student["phone_number"]
        grade_name = new_student["grade"]
        subjects = new_student["subjects"]  # Object type List of subject names

        sql = """
            SELECT 1 FROM students 
            WHERE 
            email = %s
        """
        existing_email = db_helper.fetch_one(sql, (email))
        if existing_email:
            print("student already exists")
            return students_ns.abort(400, "Email already exists")
            return {"message": "Email or name already exists"}, 400

        # Get grade_id from the database using helper function
        grade_id = get_grade_id(db_helper, grade_name)
        if not grade_id:
            return students_ns.abort(400, f"Grade '{grade_name}' not found")
            return {"message": f"Grade '{grade_name}' not found"}, 400

        # Check if name already exists
        sql = """
            SELECT COUNT(*) FROM students
            WHERE
            name = %s
        """
        existing_name = db_helper.fetch_one(sql, (name))

        # if name already exists, append a number to the name
        # to make it unique
        if existing_name["COUNT(*)"] > 0:
            name = name + str(existing_name["COUNT(*)"] + 1)

        # Insert student data into the students table and get the student ID
        sql = "INSERT INTO students (name, school, email, phone_number, grade_id) VALUES (%s, %s, %s, %s, %s)"
        student_id = db_helper.execute(
            sql, (name, school, email, phone_number, grade_id)
        )

        print("student_id value", student_id)

        # Insert subjects into student_subjects table with validation
        for subject in subjects:
            subject_name = subject["subject_name"]

            subject_id = get_subject_id(db_helper, subject_name)
            if not subject_id:
                students_ns.abort(
                    400, f"Invalid subject: {subject_name}"
                )  # Prevent inserting invalid subjects

            sql_insert_student_subject = (
                "INSERT INTO student_subjects (student_id, subject_id) VALUES (%s, %s)"
            )
            db_helper.execute(sql_insert_student_subject, (student_id, subject_id))

        # Return the new student details
        new_student["id"] = student_id
        return new_student, 201

    @students_ns.expect(student_model)
    @students_ns.marshal_with(student_model)
    def put(self):
        """Update an existing student"""
        updated_student = students_ns.payload
        id = updated_student.get("id")
        name = updated_student.get("name")
        school = updated_student.get("school")
        email = updated_student.get("email")
        phone_number = updated_student.get("phone_number")
        grade_name = updated_student.get("grade")
        subjects = updated_student.get("subjects")  # List of subject names

        # Check if the student exists
        sql = "SELECT * FROM students WHERE id = %s"
        existing_student = db_helper.fetch_one(sql, (id,))
        if not existing_student:
            return {"message": "Student not found"}, 404

        # Update student details
        grade_id = get_grade_id(db_helper, grade_name)
        if not grade_id:
            return {"message": f"Grade '{grade_name}' not found"}, 400
        sql_update = """
            UPDATE students
            SET name = %s, school = %s, email = %s, phone_number = %s, grade_id = %s
            WHERE id = %s
        """
        db_helper.execute(sql_update, (name, school, email, phone_number, grade_id, id))

        # Update subjects if provided
        if subjects is not None:
            # First, delete existing subjects for the student
            sql_delete_subjects = "DELETE FROM student_subjects WHERE student_id = %s"
            db_helper.execute(sql_delete_subjects, (id,))

            # Insert new subjects
            for subject in subjects:
                subject_name = subject["subject_name"]
                subject_id = get_subject_id(db_helper, subject_name)
                if not subject_id:
                    students_ns.abort(400, f"Invalid subject: {subject_name}")

                sql_insert_student_subject = """
                    INSERT INTO student_subjects (student_id, subject_id)
                    VALUES (%s, %s)
                """
                db_helper.execute(sql_insert_student_subject, (id, subject_id))

        # Return the updated student details
        updated_student["id"] = id
        return updated_student


@students_ns.route("/<int:student_id>")
@students_ns.response(404, "Student not found")
class Student(Resource):
    @students_ns.marshal_with(student_model)
    def get(self, student_id):
        """Get details of a specific student"""
        sql = """
        SELECT s.id, s.name, s.school, g.grade_name as grade
        FROM students s
        JOIN grades g ON s.grade_id = g.id
        WHERE student_id = %s
        """
        students_data = db_helper.fetch_all(sql, (student_id))
        if not students_data:
            students_ns.abort(404, "Student not found")
        return students_data, 200

    @students_ns.response(204, "Student successfully deleted")
    def delete(self, student_id):
        """Delete a specific student"""
        # Delete student data from the database
        sql = "DELETE FROM students WHERE id = %s"
        result = db_helper.execute(sql, (student_id,))

        # # Check if any rows were deleted
        # if result == 0:
        #     students_ns.abort(404, "Student not found")

        return None, 204


@students_ns.route("/profile")
class Students(Resource):

    @jwt_required()
    @students_ns.marshal_with(student_profile_model)
    @students_ns.expect(resource_parser)
    def get(self):
        """Get details of a specific student (less secure)"""
        print("inside student profile")
        student_id = get_jwt_identity()

        sql = """
        SELECT s.id, s.name, s.school, g.grade_name as grade
        FROM students s
        JOIN grades g ON s.grade_id = g.id
        WHERE s.id = %s
        """
        student_data = db_helper.fetch_one(sql, (student_id,))

        if not student_data:
            students_ns.abort(404, "Student not found")

        return student_data, 200
