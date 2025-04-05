from unittest import TestCase
from tests.api.test_req_utils import test_post
from src.db.utils.db import Database
from src.db.form_hosting import generate_form_table

class FormUtilsTest(TestCase):
  def setUp(self):
    self.db = Database('test')
    user_data = {
      'email': 'dummy@g.mail.edu',
      'password': 'here_we_are_again'
    }
    self.db.exec_sql_file('config/demo_db_setup.sql')
    test_post(self, 'http://localhost:5001/accounts', json=user_data, expected_status=201)
    account_id = self.db.select("SELECT id FROM accounts WHERE email = %s;", [user_data['email']])[0][0]
    self.form_id = self.db.exec_commit('INSERT INTO hosted_forms (account_id) VALUES (%s) RETURNING id;', [account_id])[0]

  def tearDown(self):
    self.db.cleanup(True)

  def test_generate_form_table(self):
    """
    The util function `generate_form_table` inserts a new table into the schema
    with the correct name.
    """
    generate_form_table(self.db, self.form_id)
    formatted_name = 'f' + self.form_id.replace('-','')
    self.assertIsNotNone(self.db.tables[formatted_name], f'Expected form table "{formatted_name}" to be generated.')