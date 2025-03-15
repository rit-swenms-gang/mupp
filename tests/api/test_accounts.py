from unittest import TestCase
from src.db.utils.db import Database
from tests.api.test_req_utils import test_get, test_post

base_url = 'http://localhost:5001'
endpoint = '/accounts'

class AccountEnpointTest(TestCase):
  def setUp(self):
    self.db = Database('test')
    self.db.exec_sql_file('config/demo_db_setup.sql')
    self.db.exec_commit(
      """
      INSERT INTO accounts (username, email, password)
      VALUES (%s, %s, %s), (%s, %s, %s);
      """, (('test', 'test@fake.email.com', 'dummy', 'dummy', 'dummy@fake.email.com', 'password'))
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
      f"Expected {excepted_user_count} accounts in database"
    )

  def test_post_adds_account_to_database(self):
    """
    POST requests to the /accounts endpoint adds an account to the database
    """
    excepted_user_count = 3
    dummy_user = { 'username': 'new_user', 'email': 'new_user@fake.email.com','password': 'test'}
    test_post(self, base_url + endpoint, json=dummy_user, expected_status=201)
    res_accounts = test_get(self, base_url + endpoint)
    self.assertEqual(
      len(res_accounts),
      excepted_user_count,
      f"Expected {excepted_user_count} accounts in database"
    )

  def test_post_does_not_add_duplicate_email_to_database(self):
    """
    POST requests with duplicate emails to the /accounts endpoint return 409 and do not add user to the database
    """
    excepted_user_count = 2
    dup_email = self.db.exec_commit("SELECT email FROM accounts LIMIT 1;")[0]
    dummy_user = { 'username': 'new_user', 'email': dup_email,'password': 'test'}
    res_post = test_post(self, base_url + endpoint, json=dummy_user, expected_status=409)
    self.assertEqual(res_post, 'email already in use')
    res_accounts = test_get(self, base_url + endpoint)
    self.assertEqual(
      len(res_accounts),
      excepted_user_count,
      f"Expected {excepted_user_count} accounts in database"
    )

  def test_post_responds_with_missing_attributes(self):
    """
    POST requests with missing email or password receive a response with bundled errors
    """
    dummy_user = { 'username': 'new_user' }
    res_post = test_post(self, base_url + endpoint, json=dummy_user, expected_status=400)
    msg = res_post['message']
    self.assertEqual(
      len(msg),
      2,
      'Expected 2 bundled errors in message'
    )
    missing_attrs = ('email', 'password')
    for attr in missing_attrs:
      err = msg[attr]
      self.assertEqual(err, f"'{attr}' is a required property", f"Expected {attr}")

    