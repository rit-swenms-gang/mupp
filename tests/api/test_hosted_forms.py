from unittest import TestCase
from src.db.utils.db import Database
from tests.api.test_req_utils import test_get, test_post, test_put, test_delete

base_url = 'http://localhost:5001'
endpoint = '/forms'

class FormsResourceTest(TestCase):
  def setUp(self):
    self.db = Database('test')
    self.db.exec_sql_file('config/demo_db_setup.sql')
    self.db.fetch_tables()
    self.account_ids = self.db.exec_commit(
        """
        INSERT INTO accounts (username, email, password, salt)
        VALUES (%s, %s, %s, %s), (%s, %s, %s, %s)
        RETURNING id;
        """, ('test', 'test@fake.email.com', 'dummy', 'salt', None, 'dummy@fake.email.com', 'test', 'salt')
    )

  def tearDown(self):
    self.db.cleanup()

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
    test_post(self, base_url + endpoint, json={
      'account_id': self.account_ids[0][0]
    }, expected_status=201)
    self.db.fetch_tables()
    self.assertEqual(
      expected_table_count,
      len(self.db.tables),
      f"Expected {expected_table_count} form tables in database"
    )

  def test_post_returns_form_id_on_success(self):
    """
    POST requests to the /forms endpoint to return generated table id
    """
    res = test_post(self, base_url + endpoint, json={
      'account_id': self.account_ids[1][0]
    }, expected_status=201)
    self.db.fetch_tables()
    self.assertIsNotNone(res.get('form_endpoint'), 'Expected to receive a generated endpoint.')

  def test_post_does_not_add_table_without_owner(self):
    """
    POST requests to the /forms endpoint does not add a table when missing data
    """
    expected_table_count = len(self.db.tables)
    test_post(self, base_url + endpoint, json={
      'account_id': 0
    }, expected_status=406)
    self.db.fetch_tables()
    self.assertEqual(
      expected_table_count,
      len(self.db.tables),
      f"Expected {expected_table_count} form tables in database"
    )

  def test_post_returns_error_when_missing_data(self):
    """
    POST requests to the /forms endpoint does not add a table when missing data
    """
    res = test_post(self, base_url + endpoint, json={
      'account_id': 0
    }, expected_status=406)
    self.db.fetch_tables()
    expected_error_message = 'Account not found'
    self.assertEqual(
      expected_error_message, 
      res.get('message'), 
      f'Expected message "{expected_error_message}".'
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