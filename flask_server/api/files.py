from flask import send_from_directory, current_app, Response, send_file
import os
from flask_restx import Namespace, Resource
from db import DBHelper

files_ns = Namespace("files", description="File handling operations")

EXAM_FOLDER = "./uploads/exams"
STUDENT_FOLDER = "./uploads"
REPORT_FOLDER = "./reports"

db_helper = DBHelper()


@files_ns.route("/<string:filename>")
class File(Resource):
    def get(self, filename):
        """Serve a file from the uploads directory."""
        file_path = os.path.join(EXAM_FOLDER, filename)

        print("file_path ", file_path)

        # Check if the file exists before serving it
        if not os.path.exists(file_path):
            return {"message": "File not found"}, 404

        # def generate():
        #     with open(file_path, "rb") as f:
        #         while chunk := f.read(8192):  # Read in 8KB chunks
        #             yield chunk

        # return Response(generate(), content_type="application/octet-stream")
        print("passed")
        # Serve the file using Flask's send_from_directory function
        return send_from_directory(EXAM_FOLDER, filename, as_attachment=True)


@files_ns.route("/reports/<string:filename>")
class File(Resource):
    def get(self, filename):
        """Serve a file from the uploads directory."""
        file_path = os.path.join(REPORT_FOLDER, filename)

        print("file_path ", file_path)

        # Check if the file exists before serving it
        if not os.path.exists(file_path):
            return {"message": "File not found"}, 404
        print("passed")
        # Serve the file using Flask's send_from_directory function
        return send_from_directory(REPORT_FOLDER, filename)


@files_ns.route(
    "/comment_file/<string:filename>/<int:student_id>/<int:selected_homework_id>"
)
class File(Resource):
    def delete(self, filename, student_id, selected_homework_id):
        """Delete a comment file for a specific student"""

        sql = "UPDATE exam_submissions set comment_file_name = NULL WHERE id = %s"
        result = db_helper.execute(sql, (selected_homework_id))

        file_path = os.path.join(STUDENT_FOLDER, str(student_id), filename)

        if os.path.exists(file_path):
            os.remove(file_path)
            return {"message": "Comment file deleted successfully"}, 200
        else:
            return {"message": "File not found"}, 400


# @files_ns.route("/<int:student_id>/<string:filename>")
# class File(Resource):
#     def get(self, student_id, filename):
#         """Serve a file from the uploads directory."""
#         student_dir = os.path.join(STUDENT_FOLDER, str(student_id))  # Student-specific folder
#         file_path = os.path.join(student_dir, filename)

#         print("file_path ", file_path)

#         # Check if the file exists before serving it
#         if not os.path.exists(file_path):
#             return {"message": "File not found"}, 404

#         # def generate():
#         #     with open(file_path, "rb") as f:
#         #         while chunk := f.read(8192):  # Read in 8KB chunks
#         #             yield chunk

#         # return Response(generate(), content_type="application/octet-stream")
#         print("passed")
#         # Serve the file using Flask's send_from_directory function
#         test = send_from_directory(student_dir, filename, conditional=False)
#         print("test", test)
#         return test
