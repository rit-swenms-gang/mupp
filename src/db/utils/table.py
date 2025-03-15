from datetime import date, datetime

class Table():
  def __init__(
    self, name: str, columns: list, 
    # Typing this accurately results in circular import
    database #: 'Database'  type: ignore
  ):
    self._name = name
    self._columns = columns
    self._database = database

  def parse_obj(self, entity: tuple):
    """
      Parse database entity tuple into a JSON serializable object
    """
    obj = {}
    for col in self._columns:
      obj[col['column_name']] = entity[(col['ordinal_position'] - 1)]
      # TODO: verify types form col['type']
      col_type = type(obj[col['column_name']])
      if col_type is date or col_type is datetime:
        obj[col['column_name']] = obj[col['column_name']].strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    return obj
  
  def parse_array_of_ojbs(self, entities: list):
    """
      Parse a list of database entity tuples
    """
    arr = []
    for entity in entities:
      arr.append(self.parse_obj(entity))
    return arr

  def select(self, fields:list=[], where:dict={}, number:int=None):
    """
      Select entities from the current table and return them as JSON objects.
    """
    filtered_fields = []
    filtered_where = []
    values = []
    
    for column in self._columns:
      if column['column_name'] in fields:
        filtered_fields.append(column['column_name'])
      if column['column_name'] in where:
        filtered_where.append(column['column_name'] + '=%s')
        # TODO: validate type
        values.append(where[column['column_name']])

    query = f"""
      SELECT {
        '*' if len(filtered_fields) == 0
        else ', '.join(filtered_fields)
      }
      FROM {self._name}
      {
        '' if len(filtered_where) == 0
        else 'WHERE ' + ' AND '.join(filtered_where)
       };
    """
    res = self._database.select(query, values, number)
    if res is None: return None
    return (
      self.parse_obj(res) if type(res) is tuple 
        else self.parse_array_of_ojbs(res)
    )
  
  def insert(self, fields:dict={}, returning:list=''):
    """
      Insert an object by converting into an entity tuple.
    """
    filtered_fields = []
    value_holder = []
    filtered_returning = []
    values = []

    for column in self._columns:
      if column['column_name'] in fields:
        filtered_fields.append(column['column_name'])
        value_holder.append('%s');
        values.append(fields[column['column_name']])
      if type(returning) is list and column['column_name'] in returning:
        filtered_returning.append(column['column_name'])

    query = f"""
      INSERT INTO {self._name}
      ({', '.join(filtered_fields)})
      VALUES ({', '.join(value_holder)})
      {
        'RETURNING ' + 
        ', '.join(filtered_returning) if type(returning) is list
        else returning
      };
    """
    return self._database.exec_commit(query, values)