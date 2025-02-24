import jwt
import bcrypt
from flask import request
from flask_restx import Resource, Api, Namespace, fields
from db import DBHelper
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)


users = {}

Auth = Namespace(
    name="Auth",
    description="사용자 인증을 위한 API",
)

user_fields = Auth.model(
    "User",
    {  # Model 객체 생성
        "email": fields.String(
            description="User email", required=True, example="phinguin@gmail.com"
        )
    },
)

user_fields_auth = Auth.inherit(
    "User Auth",
    user_fields,
    {
        "password": fields.String(
            description="Password", required=True, example="password"
        )
    },
)

jwt_fields = Auth.model(
    "JWT",
    {
        "Authorization": fields.String(
            description="Authorization which you must inclued in header",
            required=True,
            example="eyJ0e~~~~~~~~~",
        )
    },
)

db_helper = DBHelper()


@Auth.route("/token/reissue", methods=["GET"])
class TokenReissue(Resource):
    @jwt_required(refresh=True)  # Ensure this route requires the refresh token
    def get(self):
        # The identity of the user will be the same as the one that requested the refresh token
        current_user_id = get_jwt_identity()

        # Create new access token
        new_access_token = create_access_token(identity=current_user_id)
        new_refresh_token = create_refresh_token(identity=current_user_id)

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
        }, 200


@Auth.route("/register")
class AuthRegister(Resource):
    @Auth.expect(user_fields_auth)
    @Auth.doc(responses={200: "Success"})
    @Auth.doc(responses={500: "Register Failed"})
    def post(self):
        name = request.json["name"]
        password = request.json["password"]
        if name in users:
            return {"message": "Register Failed"}, 500
        else:
            users[name] = bcrypt.hashpw(
                password.encode("utf-8"), bcrypt.gensalt()
            )  # 비밀번호 저장
            return {
                "Authorization": jwt.encode(
                    {"name": name}, "secret", algorithm="HS256"
                )  # str으로 반환하여 return
            }, 200


@Auth.route("/login")
class AuthLogin(Resource):
    @Auth.expect(user_fields_auth)
    @Auth.doc(responses={200: "Success"})
    @Auth.doc(responses={404: "User Not Found"})
    @Auth.doc(responses={500: "Auth Failed"})
    def post(self):
        print("inside post")
        email = request.json["email"]
        password = request.json["password"]

        student_sql = "SELECT * FROM students WHERE email = %s"
        student = db_helper.fetch_one(student_sql, (email,))

        if not student:
            return {"message": "Student Not Found"}, 404

        # default password is 2550
        default_password = bcrypt.hashpw("2550".encode("utf-8"), bcrypt.gensalt())
        if not bcrypt.checkpw(
            password.encode("utf-8"), default_password
        ):  # 비밀번호 일치 확인
            return {"message": "Auth Failed"}, 500

        # Generate JWT token
        access_token = create_access_token(identity=student["id"])
        refresh_token = create_refresh_token(identity=student["id"])

        return {"access_token": access_token, "refresh_token": refresh_token}, 200


@Auth.route("/get")
class AuthGet(Resource):
    @Auth.doc(responses={200: "Success"})
    @Auth.doc(responses={404: "Login Failed"})
    def get(self):
        header = request.headers.get("Authorization")  # Authorization 헤더로 담음
        if header == None:
            return {"message": "Please Login"}, 404
        data = jwt.decode(header, "secret", algorithms="HS256")
        return data, 200


@Auth.route("/admin/login")
class AuthAdminLogin(Resource):
    @Auth.expect(user_fields_auth)
    @Auth.doc(responses={200: "Success"})
    @Auth.doc(responses={404: "Admin Not Found"})
    @Auth.doc(responses={500: "Auth Failed"})
    def post(self):
        print("inside admin login post")
        email = request.json["email"]
        password = request.json["password"]

        teachers_sql = "SELECT * FROM teachers WHERE email = %s"
        teacher = db_helper.fetch_one(teachers_sql, (email,))

        if not teacher:
            return {"message": "teacher Not Found"}, 404

        # Default password for admin, you can change this as needed
        admin_password = (
            "adminpassword"  # Replace with your actual admin password, ideally hashed
        )

        # Check if the provided password matches the stored admin password
        if not bcrypt.checkpw(
            password.encode("utf-8"),
            bcrypt.hashpw(admin_password.encode("utf-8"), bcrypt.gensalt()),
        ):
            return {"message": "Auth Failed"}, 500

        # Generate JWT token for admin
        access_token = create_access_token(identity=teacher["id"])
        refresh_token = create_refresh_token(identity=teacher["id"])

        return {"access_token": access_token, "refresh_token": refresh_token}, 200
