import pymysql
from pymysql.cursors import DictCursor


class DBHelper:
    def __init__(self):
        self.host = "before-delete.cnei022gkt6q.ap-northeast-2.rds.amazonaws.com"
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
                # cursor.execute("SET SESSION group_concat_max_len = 1000000;")
                cursor.execute(query, params)
                connection.commit()
                return cursor.lastrowid
        finally:
            connection.close()

    def execute_transaction(self, queries_and_params):
        """
        Execute multiple queries in a single transaction.
        If any query fails, all changes are rolled back.
        
        Args:
            queries_and_params: List of tuples (query, params)
            
        Returns:
            List of results from each query execution
        """
        connection = self.get_connection()
        try:
            with connection.cursor() as cursor:
                results = []
                for query, params in queries_and_params:
                    cursor.execute(query, params)
                    results.append(cursor.lastrowid)
                connection.commit()
                return results
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()

    def execute_with_transaction(self, queries_and_params):
        """
        Execute multiple queries in a single transaction with row count tracking.
        If any query fails, all changes are rolled back.
        
        Args:
            queries_and_params: List of tuples (query, params)
            
        Returns:
            List of tuples (lastrowid, rowcount) for each query
        """
        connection = self.get_connection()
        try:
            with connection.cursor() as cursor:
                results = []
                for query, params in queries_and_params:
                    cursor.execute(query, params)
                    results.append((cursor.lastrowid, cursor.rowcount))
                connection.commit()
                return results
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()
