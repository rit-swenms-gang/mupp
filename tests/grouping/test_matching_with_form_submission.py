from unittest import TestCase
from src.MatchingAlgorithms import *
from tests.api.test_req_utils import test_post
from src.db.utils.db import Database
from src.db.form_hosting import generate_form_table, format_table_name

class TestMatchingWithFormSubmission(TestCase):
    def setUp(self):
        self.db = Database('test')
        self.db.exec_sql_file('config/demo_db_setup.sql')
        self.db.fetch_tables()
        self.account_id = self.db.exec_commit(
            """
            INSERT INTO accounts (username, email, password, salt)
            VALUES (%s, %s, %s, %s)
            """, ('matchadmin', 'matchadmin@test.com', 'password', 'salt')
        )[0][0]

        self.form_structure = {
            "name": "text",
            "email": "text",
            "answers": "json"
        }
        form_data = {
            'account_id': self.account_id,
            'form_structure': self.form_structure
        }
        result = test_post(self, 'http://localhost:5001/forms', json=form_data, header={'session-key': 'form_session'}, expected_status=201)
        self.form_id = result.get('form_endpoint')
        
        generate_form_table(self.db, self.form_id)
        self.table_name = format_table_name(self.form_id)
        """Seeddata for Leaders"""
        self.leaders = [
            Leader("Tyler", "Tyler@mupp.com", [2,0,1,3,2]),
            Leader("Shahmir", "Shahmir@mupp.com", [2,0,1,3,2]),
            Leader("JoJo", "JoJo@mupp.com", [2,0,1,3,2]),
            Leader("Christian", "Christian@mupp.com", [2,0,1,3,2]),
            Leader("Andrew", "Andrew@mupp.com", [2,0,1,3,2]),
            Leader("Evan", "Evan@mupp.com", [2,0,1,3,2])
        ]