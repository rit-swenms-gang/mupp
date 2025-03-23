from unittest import TestCase
from src.db.utils.db import Database

class TableUtilsTest(TestCase):
  def setUp(self):
    self.db = Database('test')
    self.table_name = 'table_utils'
    self.db.exec_commit(
      f"""
      BEGIN;

      DROP TABLE IF EXISTS {self.table_name};
      CREATE TABLE {self.table_name}(
        id SERIAL,
        test_field VARCHAR
      );

      INSERT INTO {self.table_name} (test_field) VALUES ('dummy');
      INSERT INTO {self.table_name} (test_field) VALUES ('another dummy');

      COMMIT;
      """
    )
    self.db.fetch_tables()
    self.table = self.db.tables[self.table_name]

  def tearDown(self):
    self.db.cleanup(True)

  def test_table_is_fetched(self):
    self.assertIsNotNone(self.db.tables)
    self.assertEqual(1, len(self.db.tables), 'Expected single Table in test schema')
    self.assertEqual(self.table_name, str(self.table), "Expected table to have name {}".format(self.table_name))

  def test_select_retrieves_all_table_entities(self):
    res = self.table.select()
    self.assertIsNotNone(res, 'Expected response from database')
    self.assertEqual(2, len(res), 'Expected array of 2 entities from database')

  def test_select_retrieves_entity_by_WHERE(self):
    res1 = self.table.select(where={ 'id': 1 })
    self.assertEqual({ 'id': 1, 'test_field': 'dummy' }, res1[0], 'Expected to retrieve object by id')
    res2 = self.table.select(where={ 'test_field': 'another dummy' })
    self.assertEqual({ 'id': 2, 'test_field': 'another dummy' }, res2[0], 'Expected to retrieve object by test_field')

  def test_insert_adds_entity(self):
    init_cout = self.db.exec_commit("SELECT COUNT(*) FROM {};".format(self.table_name))[0]
    self.table.insert({ 'test_field': 'inserted' })
    updated_count = self.db.exec_commit("SELECT COUNT(*) FROM {};".format(self.table_name))[0]
    self.assertEqual(init_cout + 1, updated_count, 'Expected count to increase by 1')
    inserted = self.db.exec_commit("SELECT * FROM {} WHERE test_field = %s;".format(self.table_name), ['inserted'])
    self.assertEqual((updated_count, 'inserted'), inserted, 'Expected new entity to be found')

  def test_insert_adds_entity_and_returns(self):
    res = self.table.insert({ 'test_field': 'inserted' }, ['id', 'test_field'])
    updated_count = self.db.exec_commit("SELECT COUNT(*) FROM {};".format(self.table_name))[0]
    self.assertEqual((updated_count, 'inserted'), res, 'Expected new entity to returned in method call')
  