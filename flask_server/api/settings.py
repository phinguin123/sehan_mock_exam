from flask_restx import Namespace, Resource
from utils.utils import send_alimtalk_check, send_alimtalk_student_credentials
from db import DBHelper
from flask import request
from datetime import datetime
import shutil
import os
from pytz import timezone
import logging
import utils.logging_config

logger = logging.getLogger(__name__)

settings_ns = Namespace("settings", description="Utility-related operations")

db_helper = DBHelper()


@settings_ns.route("/")
class Settings(Resource):
    def post(self):
        """Send alimtalk message for testing (for all students)"""

        sql = """
            SELECT phone_number from students
        """
        phone_numbers = db_helper.fetch_all(sql)

        for row in phone_numbers:
            phone_number = row["phone_number"]
            send_alimtalk_check(phone_number)

        return {"message": "Alimtalk message sent successfully"}, 200


@settings_ns.route("/<int:student_id>")
class Settings(Resource):
    def post(self, student_id):
        """Send credentials message for testing (for one student)"""

        sql = """
            SELECT phone_number, email from students where id = %s
        """
        result = db_helper.fetch_one(sql, student_id)

        sql = """
            SELECT credentials_notice_text from settings
        """
        credentials_notice_text = db_helper.fetch_one(sql)["credentials_notice_text"]

        phone_number = result["phone_number"]
        email = result["email"]
        send_alimtalk_student_credentials(phone_number, email, credentials_notice_text)

        return {"message": "Alimtalk message sent successfully"}, 200


@settings_ns.route("/credentials")
class SettingsCredentials(Resource):

    def get(self):
        sql = """
            SELECT credentials_notice_text from settings
        """

        credentials_notice_text = db_helper.fetch_one(sql)["credentials_notice_text"]

        return {"credentials_notice_text": credentials_notice_text}

    def post(self):
        """Send student id and password (for all students)"""
        data = request.json.get("credentialsNotice")

        sql = """
            SELECT COUNT(*) FROM settings;
        """

        result = db_helper.fetch_all(sql)

        # if data already exist, update
        if result[0]["COUNT(*)"] == 1:
            sql = """
                UPDATE settings SET credentials_notice_text = %s
            """
            db_helper.execute(sql, (data))
        else:
            sql = """
                INSERT INTO settings (credentials_notice_text) VALUES (%s)
            """
            db_helper.execute(sql, (data))

        sql = """
            SELECT phone_number, email from students
        """
        results = db_helper.fetch_all(sql)

        for row in results:
            phone_number = row["phone_number"]
            email = row["email"]
            send_alimtalk_student_credentials(phone_number, email, data)

        return {"message": "Alimtalk message sent successfully"}, 200


@settings_ns.route("/report/notice_text")
class SettingsReportNoticeText(Resource):
    def get(self):
        sql = """
            SELECT notice_text from settings
        """

        notice_text = db_helper.fetch_one(sql)["notice_text"]

        return {"notice_text": notice_text}

    def post(self):
        """Set notice text at the end of report"""
        data = request.json

        sql = """
            SELECT COUNT(*) FROM settings;
        """

        result = db_helper.fetch_all(sql)

        # if data already exist, update
        if result[0]["COUNT(*)"] == 1:
            sql = """
                UPDATE settings SET notice_text = %s
            """
            db_helper.execute(sql, (data["reportNotice"]))

            return {"message": "Successfully updated notice text"}, 201
        else:
            sql = """
                INSERT INTO settings (notice_text) VALUES (%s)
            """
            db_helper.execute(sql, (data["reportNotice"]))

            return {"message": "Successfully set notice text"}, 201


@settings_ns.route("/exam_end_time")
class SettingsExamEndTIme(Resource):
    def get(self):
        """Get exam end time"""
        sql = """
            SELECT exam_end_time, hours_before from settings
        """

        result = db_helper.fetch_one(sql)
        hours_before = result["hours_before"]
        exam_end_time = result["exam_end_time"]

        if exam_end_time == "0000-00-00 00:00:00":
            return {"exam_end_time": None, "hours_before": hours_before}

        print("result value", result)

        formatted_exam_end_time = exam_end_time.strftime("%Y-%m-%dT%H:%M")

        return {"exam_end_time": formatted_exam_end_time, "hours_before": hours_before}

    def post(self):
        """Set exam end time"""
        data = request.json
        hours_before = data["hoursBefore"]

        exam_end_time = datetime.strptime(data["examEndTime"], "%Y-%m-%dT%H:%M")

        sql = """
            SELECT COUNT(*) FROM settings;
        """

        result = db_helper.fetch_all(sql)

        # if data already exist, update
        if result[0]["COUNT(*)"] == 1:
            sql = """
                UPDATE settings SET exam_end_time = %s, hours_before = %s
            """
            db_helper.execute(sql, (exam_end_time, hours_before))

            return {"message": "Successfully updated exam end time"}, 201
        else:
            sql = """
                INSERT INTO settings (exam_end_time, hours_before) VALUES (%s, %s)
            """
            db_helper.execute(sql, (exam_end_time, hours_before))

            return {"message": "Successfully set exam end time"}, 201


@settings_ns.route("/reset")
class SettingsResetServer(Resource):
    def delete_folder(folder_name):
        folder_path = os.path.join(
            "/home/ubuntu/sehan_mock_exam/flask_server", folder_name
        )

        if os.path.exists(folder_path):
            try:
                # Using shutil.rmtree to delete non-empty folders
                shutil.rmtree(folder_path)

                os.makedirs(folder_path)
                return True
            except Exception as e:
                return False
        else:
            return False

    def post(self):
        """Reset server. Delete students and all files"""
        sql = """
            START TRANSACTION;

            DELETE FROM exam_submissions;
            DELETE FROM student_subjects;
            DELETE FROM exams;
            DELETE FROM students;

            COMMIT;
        """

        db_helper.execute(sql)

        if self.delete_folder("uploads") and self.delete_folder("reports"):
            return {"message": "successfully delete everything~"}
        else:
            return {"message": "Call Jitae!"}
