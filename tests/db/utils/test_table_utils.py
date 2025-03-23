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

  def test_select_turns_in_object_format_with_all_keys(self):
    res = self.table.select()
    self.assertIsInstance(res[0], dict, 'Expected a dictionary object to be returned')
    for column in self.table._columns:
      name = column['column_name']
      self.assertIsNotNone(res[0][name], 'Expected object to have have all columns by default, missing {}'.format(name))

  def test_select_retrieves_entity_by_WHERE(self):
    res1 = self.table.select(where={ 'id': 1 })
    self.assertEqual({ 'id': 1, 'test_field': 'dummy' }, res1[0], 'Expected to retrieve object by id')
    res2 = self.table.select(where={ 'test_field': 'another dummy' })
    self.assertEqual({ 'id': 2, 'test_field': 'another dummy' }, res2[0], 'Expected to retrieve object by test_field')

  def test_select_LIMIT_one_returns_object(self):
    limit = 1
    res = self.table.select(number=limit)
    self.assertEqual(dict, type(res), f'Expected object to be returned for single object')

  def test_insert_adds_entity(self):
    init_count = self.db.exec_commit("SELECT COUNT(*) FROM {};".format(self.table_name))[0]
    self.table.insert({ 'test_field': 'inserted' })
    updated_count = self.db.exec_commit("SELECT COUNT(*) FROM {};".format(self.table_name))[0]
    self.assertEqual(init_count + 1, updated_count, 'Expected count to increase by 1')
    inserted = self.db.exec_commit("SELECT * FROM {} WHERE test_field = %s;".format(self.table_name), ['inserted'])
    self.assertEqual((updated_count, 'inserted'), inserted, 'Expected new entity to be found')

  def test_insert_adds_entity_and_returns_nothing(self):
    init_count = self.db.exec_commit("SELECT COUNT(*) FROM {};".format(self.table_name))[0]
    res = self.table.insert({ 'test_field': 'inserted' })
    updated_count = self.db.exec_commit("SELECT COUNT(*) FROM {};".format(self.table_name))[0]
    self.assertEqual(init_count + 1, updated_count, 'Expected count to increase by 1')
    self.assertIsNone(res, 'Expected no return with omitted returning parameter')

  def test_insert_adds_entity_and_returns_as_object(self):
    init_count = self.db.exec_commit("SELECT COUNT(*) FROM {};".format(self.table_name))[0]
    res = self.table.insert({ 'test_field': 'inserted' }, ['id', 'test_field'])
    updated_count = self.db.exec_commit("SELECT COUNT(*) FROM {};".format(self.table_name))[0]
    self.assertEqual(init_count + 1, updated_count, 'Expected count to increase by 1')
    self.assertEqual({ 'id': updated_count, 'test_field': 'inserted' }, res, 'Expected new entity to returned in method call')

  def test_update_all_entities(self):
    original = self.db.exec_commit("SELECT * FROM {} ORDER BY id;".format(self.table_name))
    field_update = 'I was updated'
    res = self.table.update({ 'test_field': field_update }, returning=['id', 'test_field'])
    res.sort(key=lambda t: t[0])
    self.assertEqual(len(original), len(res), 'Expected update to return same number of entries')
    self.assertNotEqual(res[0][0], res[1][0], 'Expected different entities to have different ids')
    self.assertEqual(res[0][1], res[1][1], 'Expected different entities to have same test fields')
    for i in range(len(res)):
      self.assertEqual(original[i][0], res[i][0], 'Expected original and update to have same id')
      self.assertNotEqual(original[i][1], res[i][1], 'Expected original and update to have different test fields')
  