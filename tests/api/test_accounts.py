from unittest import TestCase
from src.db.utils.db import Database
from tests.api.test_req_utils import test_get, test_post

base_url = 'http://localhost:5001'
endpoint = '/accounts'

class AccountEnpointTest(TestCase):
  def setUp(self):
    # TODO: use test schema to limit interactions between dev and prod
    self.db = Database('public')
    self.db.exec_sql_file('config/demo_db_setup.sql')

  def test_get_returns_accounts(self):
    """
    GET requests to the /accounts endpoint returns list of accounts
    """
    excepted_user_count = 2
    res_accounts = test_get(self, base_url + endpoint)
    self.assertEqual(
      len(res_accounts),
      excepted_user_count,
      'Expected 2 accounts in database'
    )

  def test_post_adds_account_to_database(self):
    """
    POST requests to the /accounts endpoint adds an account to the database
    """
    excepted_user_count = 3
    dummy_user = { 'name': 'test', 'password': 'test'}
    test_post(self, base_url + endpoint, json=dummy_user)
    res_accounts = test_get(self, base_url + endpoint)
    self.assertEqual(
      len(res_accounts),
      excepted_user_count,
      'Expected 3 accounts in database'
    )