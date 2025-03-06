from unittest import TestCase
from src.db.utils.db import Database
from tests.api.test_req_utils import test_get

base_url = 'http://localhost:5001'
endpoint = '/accounts'

class AccountEnpointTest(TestCase):
  def setUp(self):
    # TODO: use test schema to limit interactions between dev and prod
    self.db = Database('public')
    self.db.exec_sql_file('config/demo_db_setup.sql')

  def test_get_returns_accounts(self):
    excepted_user_count = 2
    res_accounts = test_get(self, base_url + endpoint)
    self.assertEqual(
      len(res_accounts),
      excepted_user_count,
      'Expected 2 accounts in database'
    )