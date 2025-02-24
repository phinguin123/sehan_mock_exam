from flask import send_from_directory, current_app
import os
from flask_restx import Namespace, Resource

files_ns = Namespace("files", description="File handling operations")

UPLOAD_FOLDER = "./uploads/exams"


@files_ns.route("/<string:filename>")
class File(Resource):
    def get(self, filename):
        """Serve a file from the uploads directory."""
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        print("file_path ", file_path)

        # Check if the file exists before serving it
        if not os.path.exists(file_path):
            return {"message": "File not found"}, 404
        print("passed")
        # Serve the file using Flask's send_from_directory function
        return send_from_directory(UPLOAD_FOLDER, filename)
