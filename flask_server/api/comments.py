from flask_restx import Namespace, Resource, fields
from db import DBHelper

comments_ns = Namespace("comments", description="Exam Comments and Scores")

# Define API model for returning comments with scores
subject_comment_model = comments_ns.model(
    "SubjectComment",
    {
        "subject_id": fields.Integer(description="Subject ID"),
        "subject_name": fields.String(description="Subject Name"),
        "score": fields.Float(description="Exam Score"),
        "comment_id": fields.Integer(description="Comment ID"),
        "comment": fields.String(description="Teacher's Comment"),
    },
)

student_comments_model = comments_ns.model(
    "StudentExamComments",
    {
        "student_id": fields.Integer(description="Student ID"),
        "student_name": fields.String(description="Student Name"),
        "student_grade": fields.String(description="Student Grade"),
        "comments": fields.List(fields.Nested(subject_comment_model)),
        "school": fields.String(description="Student School"),
    },
)

db_helper = DBHelper()

@comments_ns.route("/all")
class ExamCommentsAll(Resource):
    @comments_ns.marshal_list_with(student_comments_model)
    def get(self):
        """Fetch all comments and scores for all students in one API call"""
        sql = """
        SELECT 
            s.id AS student_id, 
            s.name AS student_name,
            s.school,
            sub.id AS subject_id, 
            sub.subject_name AS subject_name,
            g.grade_name AS student_grade,
            c.comment,
            c.id AS comment_id,
            es.score
        FROM students s
        LEFT JOIN comments c ON c.student_id = s.id  -- Changed to LEFT JOIN
        LEFT JOIN subjects sub ON c.subject_id = sub.id
        JOIN grades g ON s.grade_id = g.id
        LEFT JOIN exams e ON e.subject_id = c.subject_id AND e.grade_id = s.grade_id
        LEFT JOIN exam_submissions es ON es.student_id = s.id AND es.exam_id = e.id
        ORDER BY s.id;

        """
        data = db_helper.fetch_all(sql)

        if not data:
            return {"message": "No exam comments found"}, 404

        # Organize data into structured format
        student_dict = {}

        for row in data:
            student_id = row["student_id"]

            if student_id not in student_dict:
                student_dict[student_id] = {
                    "student_id": student_id,
                    "student_name": row["student_name"],
                    "student_grade": row["student_grade"],
                    "school": row["school"],
                    "comments": [],
                }

            student_dict[student_id]["comments"].append({
                "subject_id": row["subject_id"],
                "subject_name": row["subject_name"],
                "score": row["score"],
                "comment_id": row["comment_id"],
                "comment": row["comment"],
            })

        return list(student_dict.values()), 200
