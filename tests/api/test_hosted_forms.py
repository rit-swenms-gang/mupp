from unittest import TestCase
from src.db.form_hosting import generate_form_table, format_table_name
from src.db.utils.db import Database
from tests.api.test_req_utils import test_get, test_post, test_put, test_delete
from json import dumps

base_url = "http://localhost:5001"
endpoint = "/forms"


class FormsResourceTest(TestCase):
    def setUp(self):
        self.db = Database("test")
        self.db.cleanup(True)
        self.db.exec_sql_file("config/demo_db_setup.sql")
        self.db.fetch_tables()
        self.account_ids = self.db.exec_commit(
            """
        INSERT INTO accounts (username, email, password, salt)
        VALUES (%s, %s, %s, %s), (%s, %s, %s, %s)
        RETURNING id;
        """,
            (
                "test",
                "test@fake.email.com",
                "dummy",
                "salt",
                None,
                "dummy@fake.email.com",
                "test",
                "salt",
            ),
        )

        self.dummy_form_data = {"key1": "text", "key2": "int", "key3": "json"}

        self.session_headers = {"session-key": "session_key"}

        self.db.exec_commit(
            """
        INSERT INTO logins (user_id, session_key)
        VALUES (%s, %s);
        """,
            (self.account_ids[0][0], self.session_headers.get("session-key")),
        )

        """
    CREATE TABLE logins(
      id SERIAL,
      user_id VARCHAR,
      session_key VARCHAR UNIQUE NOT NULL
    );
    """

    def tearDown(self):
        self.db.cleanup(True)

    def test_get_not_allowed_at_endpoint(self):
        """
        GET requests to the /forms endpoint returns a 405 message
        """
        test_get(self, base_url + endpoint, expected_status=405)

    def test_post_adds_form_table_to_database(self):
        """
        POST requests to the /forms endpoint generates a new table
        """
        expected_table_count = len(self.db.tables) + 1
        test_post(
            self,
            base_url + endpoint,
            json={
                "account_id": self.account_ids[0][0],
                "form_structure": self.dummy_form_data,
            },
            header=self.session_headers,
            expected_status=201,
        )
        self.db.fetch_tables()
        self.assertEqual(
            expected_table_count,
            len(self.db.tables),
            f"Expected {expected_table_count} form tables in database",
        )

    def test_post_returns_form_id_on_success(self):
        """
        POST requests to the /forms endpoint to return generated table id
        """
        res = test_post(
            self,
            base_url + endpoint,
            json={
                "account_id": self.account_ids[1][0],
                "form_structure": self.dummy_form_data,
            },
            header=self.session_headers,
            expected_status=201,
        )
        self.db.fetch_tables()
        self.assertIsNotNone(
            res.get("form_endpoint"), "Expected to receive a generated endpoint."
        )

    def test_post_does_not_add_table_without_owner(self):
        """
        POST requests to the /forms endpoint does not add a table when missing data
        """
        expected_table_count = len(self.db.tables)
        test_post(
            self,
            base_url + endpoint,
            json={"account_id": 0, "form_structure": self.dummy_form_data},
            header=self.session_headers,
            expected_status=406,
        )
        self.db.fetch_tables()
        self.assertEqual(
            expected_table_count,
            len(self.db.tables),
            f"Expected {expected_table_count} form tables in database",
        )

    def test_post_returns_error_when_missing_data(self):
        """
        POST requests to the /forms endpoint returns 406 with helpful message
        """
        res = test_post(
            self,
            base_url + endpoint,
            json={"account_id": 0, "form_structure": self.dummy_form_data},
            header=self.session_headers,
            expected_status=406,
        )
        self.db.fetch_tables()
        expected_error_message = "Account not found"
        self.assertEqual(
            expected_error_message,
            res.get("message"),
            f'Expected message "{expected_error_message}".',
        )

    def test_put_not_allowed_at_endpoint(self):
        """
        PUT requests to the /forms endpoint returns a 405 message
        """
        test_put(self, base_url + endpoint, expected_status=405)

    def test_delete_not_allowed_at_endpoint(self):
        """
        DELETE requests to the /forms endpoint returns a 405 message
        """
        test_delete(self, base_url + endpoint, expected_status=405)


class FormResourceTest(TestCase):
    def setUp(self):
        self.db = Database("test")
        self.db.cleanup(True)
        self.db.exec_sql_file("config/demo_db_setup.sql")
        self.db.fetch_tables()
        self.account_ids = self.db.exec_commit(
            """
        INSERT INTO accounts (username, email, password, salt)
        VALUES (%s, %s, %s, %s), (%s, %s, %s, %s)
        RETURNING id;
        """,
            (
                "test",
                "test@fake.email.com",
                "dummy",
                "salt",
                None,
                "dummy@fake.email.com",
                "test",
                "salt",
            ),
        )
        self.dummy_form_data = {"key1": "text", "key2": "int", "key3": "json"}

        self.endpoints = self.db.exec_commit(
            """
      INSERT INTO hosted_forms
        (account_id, form_structure)
      VALUES (%s, %s), (%s, %s)
      RETURNING id;
    """,
            [
                self.account_ids[0][0],
                dumps(self.dummy_form_data),
                self.account_ids[1][0],
                dumps(self.dummy_form_data),
            ],
        )
        for ep in self.endpoints:
            generate_form_table(self.db, ep[0])

    def tearDown(self):
        self.db.cleanup()

    def test_get_returns_form_data(self):
        """
        GET requests to the /forms/<string:form_id> endpoint returns a 200 status
        and returns the form_structure in a key-value pair.
        """
        param_endpoint = "/" + self.endpoints[0][0]
        data = test_get(self, base_url + endpoint + param_endpoint, expected_status=200)
        expected = {"form_structure": self.dummy_form_data}
        self.assertDictEqual(expected, data, "Expected sent form to be retrieved")

    def test_post_adds_data_to_correct_table(self):
        """
        POST requests to the /forms/<string:form_id> endpoint add a new entity to the table
        """
        param_endpoint = "/" + self.endpoints[0][0]
        formatted_name = format_table_name(self.endpoints[0][0])
        original_count = self.db.exec_commit(
            "SELECT COUNT(*) FROM {}".format(formatted_name)
        )[0]
        test_post(
            self,
            base_url + endpoint + param_endpoint,
            json={"key1": "now you see me", "key2": 42, "key3": {"nestedKey": "value"}},
            expected_status=201,
        )
        updated_count = self.db.exec_commit(
            "SELECT COUNT(*) FROM {}".format(formatted_name)
        )[0]
        self.assertEqual(
            original_count + 1,
            updated_count,
            f"Expected new submission to be present in table",
        )

    def test_post_returns_error_when_missing_expected_data(self):
        """
        POST requests to the /forms/<string:form_id> endpoint does not add subbmission when missing data
        """
        param_endpoint = "/" + self.endpoints[0][0]
        formatted_name = format_table_name(self.endpoints[0][0])
        original_count = self.db.exec_commit(
            "SELECT COUNT(*) FROM {}".format(formatted_name)
        )[0]
        test_post(
            self,
            base_url + endpoint + param_endpoint,
            json={"wrong_field": "dummy_data"},
            expected_status=500,
        )
        updated_count = self.db.exec_commit(
            "SELECT COUNT(*) FROM {}".format(formatted_name)
        )[0]
        self.assertEqual(
            original_count,
            updated_count,
            f"Expected incorrect submission to be not be present in table",
        )

    def test_post_ignores_extraneous_data(self):
        """
        POST requests to the /forms/<string:form_id> omits non-schema fields
        """
        param_endpoint = "/" + self.endpoints[0][0]
        formatted_name = format_table_name(self.endpoints[0][0])
        fields = {"key1": "now you see me", "wrong_field": "now you don't"}
        test_post(
            self, base_url + endpoint + param_endpoint, json=fields, expected_status=201
        )

        expected_field = self.db.tables[formatted_name].select(
            where={"key1": fields["key1"]}
        )[0]
        self.assertEqual(fields.get("key1"), expected_field.get("key1"))

    def test_put_not_allowed_at_endpoint(self):
        """
        PUT requests to the /forms/<string:form_id> endpoint returns a 405 message
        """
        param_endpoint = "/" + self.endpoints[0][0]
        test_put(self, base_url + endpoint + param_endpoint, expected_status=405)

    def test_delete_not_allowed_at_endpoint(self):
        """
        DELETE requests to the /forms/<string:form_id> endpoint returns a 405 message
        """
        param_endpoint = "/" + self.endpoints[0][0]
        test_delete(self, base_url + endpoint + param_endpoint, expected_status=405)
