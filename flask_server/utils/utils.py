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
mock_exam_report_template_code = "C_YO_002_02_64740"
alimtalk_check_template_code = "C_YO_002_02_64574"
student_credentials_template_code = "C_YO_002_02_64766"

# Send the POST request
headers = {"Content-Type": "application/json"}


def send_mock_exam_report(student_name, user_phone_number, report_link):
    payload = {
        "tas_id": tas_id,
        "send_type": "KA",
        "auth_key": auth_key,
        "data": [
            {
                "user_name": "김지태",
                "user_email": user_phone_number,  # Format: country code + phone number
                "map_content": f"""안녕하세요. 요청하신 전세계 모의고사 {student_name}학생 Assessment Report Card입니다. 확인 후 문의 사항 있으시면 언제든지 연락 바랍니다. 
{report_link}""",
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


def send_alimtalk_check(user_phone_number):
    payload = {
        "tas_id": tas_id,
        "send_type": "KA",
        "auth_key": auth_key,
        "data": [
            {
                "user_name": "김지태",
                "user_email": user_phone_number,  # Format: country code + phone number
                "map_content": f"""안녕하세요. IB강의 등록에 감사드립니다.
이 내용은 정상수신이 되는지 테스트 보내는 메세지 입니다.
메세지 받으신 경우 채널로 알려주시기 바랍니다.""",
                "sender": "0234532550",
                "sender_name": "sehanib123",
                "template_code": alimtalk_check_template_code,
            },
        ],
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)
        # print("Response:", response.json())
    except requests.exceptions.RequestException as e:
        print("Error:", e)


def send_alimtalk_student_credentials(user_phone_number, email):
    password = "2550"
    payload = {
        "tas_id": tas_id,
        "send_type": "KA",
        "auth_key": auth_key,
        "data": [
            {
                "user_name": "김지태",
                "user_email": user_phone_number,  # Format: country code + phone number
                "map_content": f"""안녕하세요. 3월 9일(일요일) IB 전세계모의고사를 위한 학생 로그인 정보를 알려드립니다.
www.sehanibexam.com 에 접속하여
아이디:{email}
패스워드 : {password}
입니다. 학생에게 꼭 전달 해주시기 바랍니다.""",
                "sender": "0234532550",
                "sender_name": "sehanib123",
                "template_code": student_credentials_template_code,
            },
        ],
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)
        # print("Response:", response.json())
    except requests.exceptions.RequestException as e:
        print("Error:", e)