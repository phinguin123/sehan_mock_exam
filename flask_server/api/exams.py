# api/exams.py
from flask_restx import Namespace, Resource, fields, reqparse
from werkzeug.datastructures import FileStorage
import os
from werkzeug.utils import secure_filename
import uuid
from db import DBHelper
from utils.utils import get_subject_id, get_grade_id
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask import request
from datetime import datetime
import pytz
from werkzeug.exceptions import BadRequest

exams_ns = Namespace("exams", description="Exam-related operations")
submissions_ns = Namespace("exam-submissions", description="Exam submission operations")

submit_exam_parser = reqparse.RequestParser()
submit_exam_parser.add_argument(
    "exam_id", type=int, required=True, help="Exam ID is required"
)
submit_exam_parser.add_argument(
    "text_attachment", type=str, required=False, help="Student ID is required"
)
submit_exam_parser.add_argument(
    "file",
    type=FileStorage,
    location="files",
    required=False,
    help="Exam file is required",
)

create_exam_parser = reqparse.RequestParser()
create_exam_parser.add_argument(
    "title", type=str, required=True, help="Title is required"
)
create_exam_parser.add_argument(
    "subject", type=str, required=True, help="Subject is required"
)
create_exam_parser.add_argument(
    "grade", type=str, required=True, help="Grade is required"
)
create_exam_parser.add_argument(
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
            description="Exam ID", required=False, example=1
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
        "file": fields.Raw(
            description="Exam file", example="filename.pdf"
        ),
        "file_name": fields.String(
            description="The file name of the uploaded exam file", example="exam_2025.pdf", required=False
        ),
    },
)

# Exam Submission Model
exam_submission_model = submissions_ns.model(
    "ExamSubmission",
    {
        "id": fields.Integer(
            description="Submission ID", required=False, example=101
        ),
        "title": fields.String(description="Exam name", required=False, example="Math Exam"),
        "name": fields.String(description="Student name", required=False, example="John Doe"),
        "subject": fields.String(description="Subject name", required=False, example="Math"),
        "grade": fields.String(
            description="Grade for the exam", required=False, example="pre-IB or 11"
        ),
        "graded_by": fields.String(description="Graded by whom?", required=False, example="phinguin"),
        "exam_id": fields.Integer(
            description="ID of the submitted exam", required=False, example=1
        ),
        "student_id": fields.Integer(
            description="ID of the student who submitted the exam", required=False, example=1001
        ),
        "file": fields.Raw(
            description="Original exam file", example="exam_solution.pdf"
        ),
        "file_name": fields.String(
            description="The file name of the uploaded exam file", example="exam_solution.pdf", required=False
        ),
        # Grading Fields (only required for teacher grading)
        "score": fields.Integer(
            description="Score out of 7", required=False, example=7
        ),
        "total_score": fields.String(
            description="Raw total score for the exam", required=False, example=20
        ),
        "raw_score": fields.String(
            description="Raw score given", required=False, example=15
        ),
        "raw_total_score": fields.Integer(
            description="Percentile out of 100", required=False, example=75
        ),
        "comment": fields.String(
            description="Feedback or comments from the teacher", required=False, example="Good work, but review section 3."
        ),
        "text_attachment": fields.String(
            description="Text attachment for the submission", required=False, example="This is a text attachment"
        ),
        "comment_file_name": fields.String(
            description="The file name of the uploaded comment file", example="uuid_comment_file.pdf", required=False
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

db_helper = DBHelper()


def calculate_remaining_time():
    # Define the target date and time (e.g., 2025-12-31 23:59:59)
    seoul_tz = pytz.timezone("Asia/Seoul")
    current_time = datetime.now(seoul_tz)
    
    
    target_date = seoul_tz.localize(datetime(2025, 3, 11, 22, 0, 0))

    # Fetch target_date from db
    sql = """
        SELECT exam_end_time FROM settings;
    """
    result = db_helper.fetch_one(sql)
    
    if not result:
        return 0

    # Calculate the difference in seconds
    target_date = result["exam_end_time"].replace(tzinfo=seoul_tz)
    remaining_time = round((target_date - current_time).total_seconds())

    if remaining_time < 0:
        remaining_time = 0

    return remaining_time


# temporary since admin login not made yet
def get_assigned_subjects(db_helper, student_id):
    # get student's grade id
    sql_grade = "SELECT grade_id FROM students WHERE id = %s"
    student_grade = db_helper.fetch_one(sql_grade, (student_id,))

    if not student_grade:
        return []

    grade_id = student_grade["grade_id"]

    sql = """
    SELECT s.subject_name
    FROM subjects s
    JOIN student_subjects ss ON ss.subject_id = s.id
    WHERE ss.student_id = %s
    """
    subjects = db_helper.fetch_all(sql, (student_id,))
    return [subject["subject_name"] for subject in subjects], grade_id


@exams_ns.route("/")
class Exams(Resource):
    @exams_ns.marshal_list_with(exam_model)
    def get(self):
        """Get list of all created exams"""
        sql = """
        SELECT e.id, e.title, s.subject_name as subject, g.grade_name as grade, e.file_name
        FROM exams e
        JOIN subjects s ON e.subject_id = s.id
        JOIN grades g ON e.grade_id = g.id
        """
        exams_data = db_helper.fetch_all(sql)

        return exams_data, 200

    @exams_ns.expect(exam_model)
    @exams_ns.marshal_with(exam_model, code=201)
    def post(self):
        """Create a new exam (Admin Only)"""
        args = create_exam_parser.parse_args()
        # exam_id = args["id"]
        title = args["title"]
        subject_name = args["subject"]
        grade_name = args["grade"]
        file = args["file"]

        # # Get subject_id from the database
        # subject_sql = "SELECT id FROM subjects WHERE subject_name = %s"
        # subject = db_helper.fetch_one(subject_sql, (subject_name,))
        # if not subject:
        #     return {"message": f"Subject '{subject_name}' not found"}, 400
        # subject_id = subject["id"]

        # # Get grade_id from the database
        # grade_sql = "SELECT id FROM grades WHERE grade_name = %s"
        # grade = db_helper.fetch_one(grade_sql, (grade_name,))
        # if not grade:
        #     return {"message": f"Grade '{grade_name}' not found"}, 400
        # grade_id = grade["id"]

        # Get subject_id from the database using helper function
        subject_id = get_subject_id(db_helper, subject_name)
        if not subject_id:
            return {"message": f"Subject '{subject_name}' not found"}, 400

        # Get grade_id from the database using helper function
        grade_id = get_grade_id(db_helper, grade_name)
        if not grade_id:
            return {"message": f"Grade '{grade_name}' not found"}, 400

        # Handle exam file for upload
        if file:
            filename = secure_filename(file.filename)

            # Ensure the file extension is preserved correctly
            base, ext = os.path.splitext(filename)
            if not ext:  # In case the extension is missing
                ext = ".pdf"  # Default to .pdf if missing

            unique_filename = f"{uuid.uuid4().hex}_{base}{ext}"  # Append a unique ID

            if not os.path.exists("./uploads/exams"):
                os.makedirs("./uploads/exams")
            file.save(os.path.join("./uploads/exams", unique_filename))

            # Insert into exams table
            sql = """
            INSERT INTO exams (title, subject_id, grade_id, file_name)
            VALUES (%s, %s, %s, %s)
            """
            exam_id = db_helper.execute(
                sql, (title, subject_id, grade_id, unique_filename)
            )

            return {
                "message": "File uploaded successfully",
                "filename": unique_filename,
                "exam_id": exam_id,
            }, 201
        return {"message": "No file provided"}, 400


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

    @exams_ns.response(204, "Exam successfully deleted")
    def delete(self, exam_id):
        """Delete a specific exam"""
        # Delete exam data from the database
        sql = "DELETE FROM exams WHERE id = %s"
        result = db_helper.execute(sql, (exam_id,))

        print("result value ", result)
        # # Check if any rows were deleted
        # if result == 0:
        #     students_ns.abort(404, "Student not found")

        return None, 204

    @jwt_required()
    @exams_ns.expect(exam_model)
    def put(self, exam_id):
        """Edit a specific exam"""
        args = create_exam_parser.parse_args()
        # exam_id = args["id"]
        title = args["title"]
        subject_name = args["subject"]
        grade_name = args["grade"]
        file = args["file"]

        print("inside put exam", exam_id, title, subject_name, grade_name, file)

        # Get subject_id from the database using helper function
        subject_id = get_subject_id(db_helper, subject_name)
        if not subject_id:
            return {"message": f"Subject '{subject_name}' not found"}, 400

        # Get grade_id from the database using helper function
        grade_id = get_grade_id(db_helper, grade_name)
        if not grade_id:
            return {"message": f"Grade '{grade_name}' not found"}, 400

        print("before files")
        # Handle exam file for upload
        if file:
            filename = secure_filename(file.filename)

            # Ensure the file extension is preserved correctly
            base, ext = os.path.splitext(filename)
            if not ext:  # In case the extension is missing
                ext = ".pdf"  # Default to .pdf if missing

            unique_filename = f"{uuid.uuid4().hex}_{base}{ext}"  # Append a unique ID

            if not os.path.exists("./uploads/exams"):
                os.makedirs("./uploads/exams")
            file.save(os.path.join("./uploads/exams", unique_filename))

            sql = """
                UPDATE exams 
                set title = %s, subject_id = %s, grade_id = %s, file_name = %s
                WHERE id = %s
            """
            db_helper.execute(
                sql, (title, subject_id, grade_id, unique_filename, exam_id)
            )

            return {"message": "exam editied successfully"}, 201
        return {"message": "No file provided"}, 400


@exams_ns.route("/students")
class Exams(Resource):
    @jwt_required()
    @exams_ns.marshal_list_with(exam_model)
    def get(self):
        """Get list of created exams for specific student"""
        student_id = get_jwt_identity()

        assigned_subjects, grade_id = get_assigned_subjects(db_helper, student_id)
        if not assigned_subjects:
            return {"message": "No subjects assigned"}, 404

        exams_data = []
        for subject in assigned_subjects:
            sql = """
            SELECT e.id, e.title, s.subject_name as subject, g.grade_name as grade, e.file_name
            FROM exams e
            JOIN subjects s ON e.subject_id = s.id
            JOIN grades g ON e.grade_id = g.id
            WHERE s.subject_name = %s AND e.grade_id = %s
            """
            exams_data += db_helper.fetch_all(sql, (subject, grade_id))

        return exams_data, 200


@submissions_ns.route("/")
class ExamSubmissions(Resource):
    # @submissions_ns.marshal_list_with(exam_submission_model)
    def get(self):
        """Get all submitted exams (For Admins)"""
        # Get query parameters from the request
        graded_status = request.args.get("graded_status")
        subject = request.args.get("subject", "").lower()
        grade = request.args.get("grade", "")
        search_query = request.args.get("searchQuery", "").lower()

        page = int(request.args.get("page", 1))  # Default to page 1
        itemsPerPage = int(
            request.args.get("itemsPerPage", 10)
        )  # Default to 10 items per page

        # Calculate offset for pagination
        offset = (page - 1) * itemsPerPage

        sql = """
        SELECT s.name, e.title, g.grade_name as grade, sub.subject_name as subject, es.id, t.name as graded_by, es.exam_id, es.student_id, es.file_name, es.comment_file_name, es.text_attachment,
                COALESCE(es.score, 0) AS score,
                COALESCE(es.total_score, 0) AS raw_total_score,
                COALESCE(es.raw_score, 0) AS raw_score,
                COALESCE(es.raw_total_score, 0) AS total_score,
                COALESCE(es.comment, '') AS comment
        FROM exam_submissions es
        LEFT JOIN exams e ON es.exam_id = e.id
        LEFT JOIN students s ON es.student_id = s.id
        LEFT JOIN subjects sub ON e.subject_id = sub.id
        LEFT JOIN grades g ON e.grade_id = g.id
        LEFT JOIN teachers t ON es.graded_by = t.id
        WHERE 1=1
        """

        # Add filter conditions to the SQL query
        params = []

        # Filter by graded status
        if graded_status:
            sql += (
                " AND es.score IS NOT NULL"
                if graded_status == "graded"
                else " AND es.score IS NULL"
            )

        # Filter by subject
        if subject and subject != "all":
            sql += " AND LOWER(sub.subject_name) LIKE %s"
            params.append(f"%{subject}%")

        # Filter by grade
        if grade and grade != "all":
            sql += " AND g.grade_name = %s"
            params.append(grade)

        # Filter by search query (searching in exam name, file, or comments)
        if search_query:
            sql += """
            AND (
                LOWER(s.name) LIKE %s OR
                LOWER(es.comment) LIKE %s OR
                LOWER(t.name) LIKE %s
            )
            """
            params.extend(
                [f"%{search_query}%", f"%{search_query}%", f"%{search_query}%"]
            )

        sql += " LIMIT %s OFFSET %s"
        params.extend([itemsPerPage, offset])

        print("params", params)

        # Execute the query with the parameters
        exam_submissions = db_helper.fetch_all(sql, params)

        # Fetch the total count for pagination
        total_count_sql = """
        SELECT COUNT(*)
        FROM exam_submissions es
        LEFT JOIN exams e ON es.exam_id = e.id
        LEFT JOIN students s ON es.student_id = s.id
        LEFT JOIN subjects sub ON e.subject_id = sub.id
        LEFT JOIN grades g ON e.grade_id = g.id
        LEFT JOIN teachers t ON es.graded_by = t.id
        WHERE 1=1
        """
        # Re-apply the filters for the total count query
        total_count_params = []
        if graded_status:
            total_count_sql += (
                " AND es.score IS NOT NULL"
                if graded_status == "graded"
                else " AND es.score IS NULL"
            )
        if subject:
            total_count_sql += " AND LOWER(sub.subject_name) LIKE %s"
            total_count_params.append(f"%{subject}%")
        if grade:
            total_count_sql += " AND g.grade_name = %s"
            total_count_params.append(grade)
        if search_query:
            total_count_sql += """
            AND (
                LOWER(s.name) LIKE %s OR
                LOWER(es.comment) LIKE %s OR
                LOWER(t.name) LIKE %s
            )
            """
            total_count_params.extend(
                [f"%{search_query}%", f"%{search_query}%", f"%{search_query}%"]
            )

        # Get total count from the database
        total_count = db_helper.fetch_one(total_count_sql, total_count_params)[
            "COUNT(*)"
        ]
        total_pages = (total_count + itemsPerPage - 1) // itemsPerPage

        # print("exam submissions", exam_submissions)

        return {
            "exam_submissions": exam_submissions,
            "total_pages": total_pages,
            "total_count": total_count,
        }, 200

    @jwt_required()
    @submissions_ns.expect(exam_submission_model)
    # @submissions_ns.marshal_with(exam_submission_model, code=201)
    def post(self):
        """Submit an exam (For Students)"""
        args = submit_exam_parser.parse_args()
        exam_id = args["exam_id"]
        student_id = get_jwt_identity()
        file = args["file"]
        text_attachment = args["text_attachment"]

        # first check if it is time to submit
        remaining_time = calculate_remaining_time()

        if remaining_time <= 0:
            return {"message": "The exam submission period has ended."}, 400

        # Check if the student already submitted the exam
        sql = """
            SELECT 1 FROM exam_submissions 
            WHERE student_id = %s
            AND exam_id = %s
        """
        existing_submission = db_helper.fetch_one(sql, (student_id, exam_id))
        if existing_submission:
            return {"message": "Already submitted"}, 400

        # Initialize the SQL query and parameters
        sql = "INSERT INTO exam_submissions (exam_id, student_id"
        params = [exam_id, student_id]

        # Handle student submitted file for upload
        if file:
            student_folder = os.path.join("./uploads/", str(student_id))

            if not os.path.exists(
                student_folder
            ):  # Create a folder for the user if it doesn't exist
                os.makedirs(student_folder)

            filename = secure_filename(file.filename)
            
            if filename == "pdf":
                filename = f"{uuid.uuid4().hex}.pdf"
            
            # Ensure the file extension is preserved correctly
            base, ext = os.path.splitext(filename)
            if not ext:  # In case the extension is missing
                ext = ".pdf"  # Default to .pdf if missing

            unique_filename = f"{base}{ext}"  # Append a unique ID
            file_path = os.path.join(student_folder, unique_filename)
            file.save(file_path)

            # Add file_name to the SQL query and parameters
            sql += ", file_name"
            params.append(filename)

        # Handle text attachment
        if text_attachment:
            # Add text_attachment to the SQL query and parameters
            sql += ", text_attachment"
            params.append(text_attachment)

        # Complete the SQL query
        sql += ") VALUES (%s, %s"
        if file:
            sql += ", %s"
        if text_attachment:
            sql += ", %s"
        sql += ")"

        # Execute the SQL query
        db_helper.execute(sql, tuple(params))

        response = {
            "message": "Submission uploaded successfully",
            "exam_id": exam_id,
        }
        if file:
            response["filename"] = filename
        if text_attachment:
            response["text_attachment"] = text_attachment

        return response, 201


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

    @jwt_required()
    @submissions_ns.expect(exam_submission_model)
    # @submissions_ns.marshal_with(exam_submission_model)
    def put(self, submission_id):
        """Grade exam submission (For admins)"""
        teacher_id = get_jwt_identity()
        # graded_submission = submissions_ns.payload
        print("received payload for graded submission")

        score = request.form.get("calculatedScore")
        raw_score = request.form.get("rawScore")
        raw_total_score = request.form.get("totalScore")
        comment = request.form.get("comment")
        student_id = request.form.get("student_id")
        file = request.files.get("file")

        try:
            raw_score = int(raw_score)
            raw_total_score = int(raw_total_score)
            score = int(score)
        except ValueError:
            raise BadRequest("Scores must be valid integers")

        student_folder = os.path.join("./uploads/", str(student_id))


        if not os.path.exists(student_folder):
            os.makedirs(student_folder)
            print("made directory")

        # handle comment file for upload
        if file:
            filename = secure_filename(file.filename)

            # Ensure the file extension is preserved correctly
            base, ext = os.path.splitext(filename)
            if not ext:  # In case the extension is missing
                ext = ".pdf"  # Default to .pdf if missing

            unique_filename = f"{uuid.uuid4().hex}_{base}{ext}"  # Append a unique ID
            file_path = os.path.join(student_folder, unique_filename)

            file.save(file_path)

            # Update the submission record in the database for file upload
            sql = """
            UPDATE exam_submissions
            SET comment_file_name = %s
            WHERE id = %s
            """

            db_helper.execute(sql, (unique_filename, submission_id))

        total_score = int((raw_score / raw_total_score) * 100)

        # Update the submission record in the database
        sql = """
        UPDATE exam_submissions
        SET score = %s, total_score = %s, raw_score = %s, raw_total_score = %s, comment = %s, graded_by = %s
        WHERE id = %s
        """
        db_helper.execute(
            sql,
            (
                score,
                total_score,
                raw_score,
                raw_total_score,
                comment,
                teacher_id,
                submission_id,
            ),
        )

        print("score", score)

        return {
            "message": "Grade submitted successfully",
            "submission_id": submission_id,
            "score": score,
            "total_score": total_score,
            "raw_score": raw_score,
            "comment": comment,
            "comment_file_name": unique_filename if file else None,
        }, 200

    @jwt_required()
    @submissions_ns.response(204, "Submitted exam successfully deleted")
    def delete(self, submission_id):
        """Delete a specific submission"""
        # Delete exam data from the database
        sql = "DELETE FROM exam_submissions WHERE id = %s"
        result = db_helper.execute(sql, (submission_id,))

        print("deleted value")
        # # Check if any rows were deleted
        # if result == 0:
        #     students_ns.abort(404, "Student not found")

        return None, 204


@submissions_ns.route("/students/<int:exam_id>")
@submissions_ns.response(404, "Submission not found")
class ExamSubmission(Resource):
    @jwt_required()
    @submissions_ns.marshal_with(exam_submission_model)
    def get(self, exam_id):
        """Get details of a specific submitted exam (for students)"""
        sql = """
            SELECT 
                id,
                student_id,
                score, 
                total_score, 
                raw_score, 
                raw_total_score, 
                comment,
                text_attachment,
                comment_file_name
            FROM exam_submissions
            WHERE exam_id = %s
            AND student_id = %s
        """
        print("exam id and student id", exam_id, get_jwt_identity())
        result = db_helper.fetch_one(sql, (exam_id, get_jwt_identity()))

        return result, 200


@exams_ns.route("/time_remaining")
class Exams(Resource):
    def get(self):
        remaining_time = calculate_remaining_time()
        
        sql = """
            SELECT hours_before from settings;
        """
        
        result = db_helper.fetch_one(sql)
        hours_before = result['hours_before']

        # Return the remaining time in seconds
        return {"remaining_time": remaining_time, "hours_before": hours_before}, 200
