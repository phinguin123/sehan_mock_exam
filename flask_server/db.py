import pymysql
from pymysql.cursors import DictCursor


class DBHelper:
    def __init__(self):
        self.host = "database-1.cnei022gkt6q.ap-northeast-2.rds.amazonaws.com"
        self.user = "admin"
        self.password = "Grow0809?M"
        self.database = "sehanDB2"

    def get_connection(self):
        return pymysql.connect(
            host=self.host,
            user=self.user,
            password=self.password,
            database=self.database,
            cursorclass=DictCursor,
        )

    def fetch_all(self, query, params=None):
        connection = self.get_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
        finally:
            connection.close()

    def fetch_one(self, query, params=None):
        connection = self.get_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchone()
        finally:
            connection.close()

    def execute(self, query, params=None):
        connection = self.get_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                connection.commit()
                return cursor.lastrowid
        finally:
            connection.close()
