from db import DBHelper

db_helper = DBHelper()


def get_subject_id(db_helper, subject_name):
    """Get subject_id from the database using subject_name"""
    subject_sql = "SELECT id FROM subjects WHERE subject_name = %s"
    subject = db_helper.fetch_one(subject_sql, (subject_name,))
    if not subject:
        return None
    return subject["id"]


def get_grade_id(db_helper, grade_name):
    """Get grade_id from the database using grade_name"""
    grade_sql = "SELECT id FROM grades WHERE grade_name = %s"
    grade = db_helper.fetch_one(grade_sql, (grade_name,))
    if not grade:
        return None
    return grade["id"]


import requests

url = "https://api.tason.com/tas-api/kakaosend"
tas_id = "koysr20@gmail.com"
auth_key = "OYSY1H-YL8B43-GU5DD5-P5JDOC_987"
mock_exam_report_template_code = "C_YO_002_02_64413"

# Send the POST request
headers = {"Content-Type": "application/json"}


def send_mock_exam_report(student_name, user_phone_number):
    payload = {
        "tas_id": tas_id,
        "send_type": "KA",
        "auth_key": auth_key,
        "data": [
            {
                "user_name": "김지태",
                "user_email": user_phone_number,  # Format: country code + phone number
                "map_content": f"안녕하세요. 요청하신 전세계 모의고사 {student_name}학생 Assessment Report Card입니다. 확인 후 문의 사항 있으시면 언제든지 연락 바랍니다.",
                "sender": "0234532550",
                "sender_name": "sehanib123",
                "template_code": mock_exam_report_template_code,
            },
        ],
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)
        # print("Response:", response.json())
    except requests.exceptions.RequestException as e:
        print("Error:", e)
