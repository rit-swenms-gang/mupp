from unittest import TestCase
from src.db.utils.db import Database
from tests.api.test_req_utils import test_get, test_post, test_put, test_delete
import hashlib, secrets
import os
os.environ['DB_SCHEMA'] = 'test'

base_url = 'http://localhost:5001'

class LoginResourceTest(TestCase):
    def setUp(self):
        self.db = Database('test')
        self.db.exec_sql_file('config/demo_db_setup.sql')
        salt = secrets.token_hex(16)
        hashed_pw = hashlib.sha512((salt + 'secure123').encode()).hexdigest()

        self.db.exec_commit(
            """
            INSERT INTO accounts (username, email, password, salt)
            VALUES (%s, %s, %s, %s);
            """, ('testuser', 'login@fake.com', hashed_pw, salt)
        )

    def tearDown(self):
        self.db.cleanup(True)

    def test_login_successful(self):
        """POST to /login with valid credentials returns session key and adds to logins table"""
        credentials = {
        'email': 'login@fake.com',
        'password': 'secure123'
        }
        res = test_post(self, base_url + '/login', json=credentials, expected_status=200)
        self.assertIn('session_key', res)
        self.assertEqual(res['message'], 'Login successful')

        logins = self.db.select("SELECT * FROM logins WHERE user_id = %s;", ['1'])
        self.assertEqual(len(logins), 1, "Login entry should be created in logins table")

    def test_login_fails_with_wrong_password(self):
        """POST to /login with invalid password returns 401 and does not add to logins table"""
        credentials = {
        'email': 'login@fake.com',
        'password': 'wrongpassword'
        }
        res = test_post(self, base_url + '/login', json=credentials, expected_status=401)
        self.assertEqual(res['message'], 'Invalid email or password')

        logins = self.db.select("SELECT * FROM logins WHERE user_id = %s;", ['1'])
        self.assertEqual(len(logins), 0, "No login entry should be created")

    def test_login_fails_with_nonexistent_user(self):
        """POST to /login with nonexistent username returns 401"""
        credentials = {
        'email': 'login@fake.com',
        'password': 'doesntmatter'
        }
        res = test_post(self, base_url + '/login', json=credentials, expected_status=401)
        self.assertEqual(res['message'], 'Invalid email or password')

    def test_logout_successful(self):
        """POST to /logout should remove session key and return success"""

        login = {
        'username': 'testuser',
        'email' : 'login@fake.com',
        'password': 'secure123'
        }
        login_res = test_post(self, base_url + '/login', json=login, expected_status=200)
        self.assertIn('session_key', login_res)

        before_logout = self.db.select("SELECT * FROM logins WHERE user_id = %s;", ['1'])
        self.assertEqual(len(before_logout), 1, "Logins table should have an entry before logout")

        logout_res = test_post(self, base_url + '/logout', json={'username': 'testuser'}, expected_status=200)
        self.assertEqual(logout_res['message'], 'Logout complete')

        after_logout = self.db.select("SELECT * FROM logins WHERE user_id = %s;", ['1'])
        self.assertEqual(len(after_logout), 0, "Logins table should be empty after logout")

    def test_get_login_table_requires_auth(self):
        """GET /logins should require a valid session key"""
        res = test_get(self, base_url + '/logins', expected_status=401)
        self.assertEqual(res['message'], "Error: Session key is required")

    def test_get_login_table_returns_data(self):
        """GET /logins returns data when session key is valid"""
        login = {
        'email': 'login@fake.com',
        'password': 'secure123'
        }
        login_res = test_post(self, base_url + '/login', json=login, expected_status=200)
        session_key = login_res['session_key']
        headers = {
        'session-key': session_key
        }

        res = test_get(self, base_url + '/logins', header=headers, expected_status=200)

        self.assertIsInstance(res, list, 'Expected list of logins')
        self.assertGreaterEqual(len(res), 1, 'Expected at least one login session in the response')
        self.assertIn('session_key', res[0])