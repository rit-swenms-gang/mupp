from unittest import TestCase
from tests.api.test_req_utils import test_post
from src.db.utils.db import Database
from src.db.form_hosting import generate_form_table, format_table_name
from json import dumps


class FormUtilsTest(TestCase):
    def setUp(self):
        self.db = Database("test")
        user_data = {"email": "dummy@g.mail.edu", "password": "here_we_are_again"}
        self.db.exec_sql_file("config/demo_db_setup.sql")
        test_post(
            self, "http://localhost:5001/accounts", json=user_data, expected_status=201
        )
        self.db.fetch_tables()
        account_id = self.db.select(
            "SELECT id FROM accounts WHERE email = %s;", [user_data["email"]]
        )[0][0]
        # form_data = '{ "key1" : "value", "key2": [1, 2, 3], "key3": { "nestedKey" : null } }'
        form_data = {
            'entities': {
            '7a77959a-eb84-447c-9ed7-200e2a674eea': {
                'type': 'textField',
                'attributes': {
                'label': 'Name',
                'required': True
                },
                
            },
            '7a49f550-5966-4c8c-89eb-a0797940fff3': {
                'type': 'numberScale',
                'attributes': {
                    'label': 'Age',
                    'weight': 1,
                    'min': 1,
                    'max': 100
                },
                
            }
            },
            'root': ['7a77959a-eb84-447c-9ed7-200e2a674eea', '7a49f550-5966-4c8c-89eb-a0797940fff3']
        }
        self.form_id = self.db.exec_commit(
            "INSERT INTO hosted_forms (account_id, form_structure) VALUES (%s, %s) RETURNING id;",
            [account_id, dumps(form_data)],
        )[0]

    def tearDown(self):
        self.db.cleanup(True)

    def test_format_table_name(self):
        """
        The util function `format_table_name` generates a table name following specified naming convention.
        """
        expected_name = "f" + self.form_id.replace("-", "")
        actual_name = format_table_name(self.form_id)
        self.assertEqual(
            expected_name,
            actual_name,
            f"Expectec {actual_name} to be formatted to form table naming convention",
        )

    def test_generate_form_table(self):
        """
        The util function `generate_form_table` inserts a new table into the schema
        with the correct name.
        """
        generate_form_table(self.db, self.form_id)
        self.db.fetch_tables()
        formatted_name = "f" + self.form_id.replace("-", "")
        self.assertIsNotNone(
            self.db.tables[formatted_name],
            f'Expected form table "{formatted_name}" to be generated.',
        )
