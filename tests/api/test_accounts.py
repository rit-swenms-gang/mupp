from unittest import TestCase
from src.db.utils.db import Database
from tests.api.test_req_utils import test_get, test_post, test_put, test_delete
import hashlib, secrets

base_url = "http://localhost:5001"
endpoint = "/accounts"


class AccountsResourceTest(TestCase):
    def setUp(self):
        self.db = Database("test")
        self.db.exec_sql_file("config/demo_db_setup.sql")
        salt1 = secrets.token_hex(16)
        salt2 = secrets.token_hex(16)
        pw1 = hashlib.sha512((salt1 + "dummy").encode()).hexdigest()
        pw2 = hashlib.sha512((salt2 + "password").encode()).hexdigest()

        self.db.exec_commit(
            """
        INSERT INTO accounts (username, email, password, salt)
        VALUES (%s, %s, %s, %s), (%s, %s, %s, %s);
        """,
            (
                "test",
                "test@fake.email.com",
                pw1,
                salt1,
                None,
                "dummy@fake.email.com",
                pw2,
                salt2,
            ),
        )

    def tearDown(self):
        self.db.cleanup(True)

    def test_get_returns_accounts(self):
        """
        GET requests to the /accounts endpoint returns list of accounts
        """
        excepted_user_count = 2
        res_accounts = test_get(self, base_url + endpoint)
        self.assertEqual(
            len(res_accounts),
            excepted_user_count,
            f"Expected {excepted_user_count} accounts in database",
        )

    def test_get_accounts_return_username_and_email(self):
        """
        GET requests to the /accounts endpoint returns list of usernames and emails
        Usernames may be None.
        """
        valid_keys = {"username", "email"}
        res_accounts = test_get(self, base_url + endpoint)
        for account in res_accounts:
            self.assertIsNotNone(
                account["email"],
                f"Account missing required attribute 'email': {account}",
            )
            for key in account:
                if key in valid_keys:
                    continue
                self.fail(
                    "Account with unexpected key '{}', only {} allowed: {}".format(
                        key, ", ".join(valid_keys), account
                    )
                )

    def test_post_adds_account_to_database(self):
        """
        POST requests to the /accounts endpoint adds an account to the database
        """
        excepted_user_count = 3
        dummy_user = {
            "username": "new_user",
            "email": "new_user@fake.email.com",
            "password": "test",
        }
        test_post(self, base_url + endpoint, json=dummy_user, expected_status=201)
        res_accounts = test_get(self, base_url + endpoint)
        self.assertEqual(
            len(res_accounts),
            excepted_user_count,
            f"Expected {excepted_user_count} accounts in database",
        )

    def test_post_does_not_add_duplicate_email_to_database(self):
        """
        POST requests with duplicate emails to the /accounts endpoint return 409 and do not add user to the database
        """
        expected_user_count = 2
        dup_email = self.db.exec_commit("SELECT email FROM accounts LIMIT 1;")[0]
        dummy_user = {"username": "new_user", "email": dup_email, "password": "test"}

        res_post = test_post(
            self, base_url + endpoint, json=dummy_user, expected_status=409
        )
        self.assertEqual(
            {"message": "email already in use"},
            res_post,
            "Expected error message in JSON format",
        )
        res_accounts = test_get(self, base_url + endpoint)
        self.assertEqual(
            len(res_accounts),
            expected_user_count,
            f"Expected {expected_user_count} accounts in database",
        )

    def test_post_responds_with_missing_attributes(self):
        """
        POST requests with missing email or password receive a response with bundled errors
        """
        dummy_user = {"username": "new_user"}
        res_post = test_post(
            self, base_url + endpoint, json=dummy_user, expected_status=400
        )
        msg = res_post["message"]
        self.assertEqual(len(msg), 2, "Expected 2 bundled errors in message")
        missing_attrs = ("email", "password")
        for attr in missing_attrs:
            err = msg[attr]
            self.assertEqual(
                err, f"'{attr}' is a required property", f"Expected {attr}"
            )

    def test_update_not_allowed(self):
        """
        For now, updates not allowed at account endpoint
        """
        test_put(self, base_url + endpoint, expected_status=405)

    def test_delete_not_allowed(self):
        """
        For now, deletions not allowed at account endpoint
        """
        test_delete(self, base_url + endpoint, expected_status=405)


class AccountResourceTest(TestCase):
    def setUp(self):
        self.db = Database("test")
        self.db.exec_sql_file("config/demo_db_setup.sql")
        salt1 = secrets.token_hex(16)
        salt2 = secrets.token_hex(16)
        login_user = {
            "username": "test",
            "email": "test@fake.email.com",
            "password": "dummy",
        }
        pw1 = hashlib.sha512((salt1 + "dummy").encode()).hexdigest()
        pw2 = hashlib.sha512((salt2 + "password").encode()).hexdigest()

        self.db.exec_commit(
            """
        INSERT INTO accounts (username, email, password, salt)
        VALUES (%s, %s, %s, %s), (%s, %s, %s, %s);
        """,
            (
                login_user["username"],
                login_user["email"],
                pw1,
                salt1,
                None,
                "dummy@fake.email.com",
                pw2,
                salt2,
            ),
        )

        login_res = test_post(
            self, base_url + "/login", json=login_user, expected_status=200
        )
        session_key = login_res["session_key"]
        self.headers = {"session-key": session_key}

    def tearDown(self):
        self.db.cleanup(True)

    def test_get_returns_account(self):
        """
        GET requests to the /accounts/<id> endpoint returns an account
        """
        account_id = 1
        username, email = self.db.select(
            "SELECT username, email FROM accounts WHERE id = %s;", [account_id]
        )[0]
        res_account = test_get(self, base_url + endpoint + f"/{account_id}")
        self.assertIsNotNone(
            res_account, "Expected object to be returned from database"
        )
        self.assertEqual(
            username,
            res_account["username"],
            "Expected returned object to have username of {}".format(username),
        )
        self.assertEqual(
            email,
            res_account["email"],
            "Expected returned object to have email of {}".format(email),
        )

    def test_get_returns_404_on_invalid_id_endpoint(self):
        """
        GET requests to the /accounts/<id> endpoint that is invalid returns 404
        """
        max_id = self.db.exec_commit("SELECT MAX(id) FROM accounts;")[0]
        account_id = max_id + 1
        res = test_get(
            self, base_url + endpoint + f"/{account_id}", expected_status=404
        )
        self.assertEqual(
            {"message": "No account found"},
            res,
            "Expected error message in form of JSON",
        )

    def test_post_not_allowed(self):
        """
        POST requests not allowed to individual user endpoints
        """
        account_id = 2
        test_post(self, base_url + endpoint + f"/{account_id}", expected_status=405)

    def test_update_sends_error_message_when_missing_required_fields(self):
        """
        PUT requests to /accounts/<id> should be fully formed entities
        """
        account_id = 1
        res = test_put(
            self,
            base_url + endpoint + f"/{account_id}",
            header=self.headers,
            expected_status=400,
        )
        username, email, password = res["message"]
        self.assertIsNotNone(username, "Expected error message for username")
        self.assertIsNotNone(email, "Expected error message for email")
        self.assertIsNotNone(password, "Expected error message for password")

    def test_update_is_reflected_in_database(self):
        """
        PUT requests to /accounts/<id> are commited to the database
        """
        account_id = 1
        original = self.db.select(
            "SELECT username, email, password FROM accounts WHERE id = %s", [account_id]
        )[0]
        update = {
            "username": f"updated {original[0]}",
            "email": "new_email@fake.mail.com",
            "password": f"new_{original[2]}",
        }
        test_put(
            self,
            base_url + endpoint + f"/{account_id}",
            json=update,
            header=self.headers,
            expected_status=200,
        )
        updated_db = self.db.select(
            "SELECT * FROM accounts WHERE id = %s", [account_id]
        )[0]
        self.assertEqual(
            account_id, updated_db[0], "Expected updated id to match update"
        )
        self.assertEqual(
            update["username"],
            updated_db[1],
            "Expected updated username to match update",
        )
        self.assertEqual(
            update["email"], updated_db[2], "Expected updated email to match update"
        )
        self.assertNotEqual(
            update["password"], updated_db[3], "Expected stored password to be hashed"
        )
        self.assertEqual(
            len(updated_db[3]), 128, "Expected SHA-512 hash to be 128 characters long"
        )

    def test_update_cannot_include_duplicate_email(self):
        """
        PUT requests to /accounts/<id> attempting to change to a used email should fail
        """
        account_id = 1
        original = self.db.select(
            "SELECT username, email, password FROM accounts WHERE id = %s", [account_id]
        )[0]
        taken_email = self.db.select(
            "SELECT email FROM accounts WHERE id = %s", [account_id + 1]
        )[0]
        update = {
            "username": original[0],
            "email": taken_email[0],
            "password": original[2],
        }
        res = test_put(
            self,
            base_url + endpoint + f"/{account_id}",
            json=update,
            header=self.headers,
            expected_status=409,
        )
        self.assertEqual(
            {"message": "email already in use"},
            res,
            "Expected error message in JSON format",
        )
        updated_db = self.db.select(
            "SELECT username, email, password FROM accounts WHERE id = %s", [account_id]
        )[0]
        self.assertEqual(original, updated_db, "Expect no change to take place")

    def test_update_returns_404_on_invalid_id_endpoint(self):
        """
        PUT requests to the /accounts/<id> endpoint that is invalid returns 404
        """
        max_id = self.db.exec_commit("SELECT MAX(id) FROM accounts;")[0]
        account_id = max_id + 1
        update = {"username": "dummy", "email": "dummmy@mail.com", "password": "dummy"}
        res = test_put(
            self,
            base_url + endpoint + f"/{account_id}",
            json=update,
            header=self.headers,
            expected_status=404,
        )
        self.assertEqual(
            {"message": "No account found"},
            res,
            "Expected error message in form of JSON",
        )

    def test_delete_removes_entity_from_database(self):
        """
        DELETE requests remove the entity
        """
        account_id = 2
        original = self.db.select(
            "SELECT username, email, password FROM accounts WHERE id = %s", [account_id]
        )
        original_count = self.db.select("SELECT COUNT(*) FROM accounts;")[0][0]
        self.assertEqual(1, len(original), "Expected entity to be in database")
        test_delete(self, base_url + endpoint + f"/{account_id}", expected_status=200)
        deleted = self.db.select(
            "SELECT username, email, password FROM accounts WHERE id = %s", [account_id]
        )
        self.assertEqual(0, len(deleted), "Expected Entity to no longer be in database")
        updated_count = self.db.select("SELECT COUNT(*) FROM accounts;")[0][0]
        self.assertEqual(
            original_count - 1, updated_count, "Expected accounts count to be decrement"
        )

    def test_delete_returns_404_on_invalid_id_endpoint(self):
        """
        DELETE requests to the /accounts/<id> endpoint that is invalid returns 404
        """
        max_id = self.db.exec_commit("SELECT MAX(id) FROM accounts;")[0]
        account_id = max_id + 1
        res = test_delete(
            self, base_url + endpoint + f"/{account_id}", expected_status=404
        )
        self.assertEqual(
            {"message": "No account found"},
            res,
            "Expected error message in form of JSON",
        )

    def test_puts_call_fails_without_login(self):
        """
        Confirms that a puts call into the accounts table will fail for an existing user
        """
        account_id = 1
        original = self.db.select(
            "SELECT username, email, password FROM accounts WHERE id = %s", [account_id]
        )[0]
        update = {
            "username": f"updated {original[0]}",
            "email": "new_email@fake.mail.com",
            "password": f"new_{original[2]}",
        }

        """Passing no session key"""
        result = test_put(
            self,
            base_url + endpoint + f"/{account_id}",
            json=update,
            expected_status=401,
        )
        self.assertEqual({"message": "Error: Session key is required"}, result)

        """Passing wrong session key"""
        self.headers["session-key"] = "12312"
        result = test_put(
            self,
            base_url + endpoint + f"/{account_id}",
            json=update,
            header=self.headers,
            expected_status=401,
        )
        self.assertEqual({"message": "Error: Invalid session key"}, result)
