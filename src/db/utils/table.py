from datetime import date, datetime

def json_prep(value):
    # TODO: verify types form col['type']
    col_type = type(value)
    if col_type is date or col_type is datetime:
      return value.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    return value

def generate_where_clause(filtered_where:list) -> str:
  """
    Return a Postgres WHERE clause, 
    or empty string if no fields given.
    TODO: Should this live on db?
  """
  return (
    'WHERE ' + ' AND '.join(filtered_where) 
    if len(filtered_where) > 0
    else '')

def generate_return_statement(filtered_returning:list) -> str:
  """
    Return a Postgres RETURNING statement, 
    or empty string if no fields given.
    TODO: Should this live on db?
  """
  return ('RETURNING ' + ', '.join(filtered_returning) 
        if len(filtered_returning) > 0
        else '')

class Table():
  def __init__(
    self, name: str, columns: list, 
    # Typing this accurately results in circular import
    database #: 'Database'  type: ignore
  ):
    self._name = name
    self._columns = columns
    # self._column_types = {}
    # for col in columns:
    #   self._column_types[col['column_name']] = col['type']
    self._database = database

  def __repr__(self):
    return self._name

  def parse_obj(self, entity: tuple, filtered_fields: list):
    """
      Parse database entity tuple into a JSON serializable object
    """
    obj = {}
    if len(filtered_fields) == 0:
      for col in self._columns:
        obj[col['column_name']] = json_prep(entity[(col['ordinal_position'] - 1)])
    else:
      for i in range(len(filtered_fields)):
        obj[filtered_fields[i]] = json_prep(entity[i])

    return obj
  
  def parse_array_of_ojbs(self, entities: list, filtered_fields: list):
    """
      Parse a list of database entity tuples
    """
    arr = []
    for entity in entities:
      arr.append(self.parse_obj(entity, filtered_fields))
    return arr

  def select(self, fields:list=[], where:dict={}, number:int|None=None):
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
      {generate_where_clause(filtered_where)};
    """
    res = self._database.select(query, values, number)
    if res is None: return None
    return (
      self.parse_obj(res, filtered_fields) if type(res) is tuple 
        else self.parse_array_of_ojbs(res, filtered_fields)
    )
  
  def insert(self, fields:dict={}, returning:list=[]):
    """
      Insert an object by converting into an entity tuple.
      Optionally return updated fields if specified in list.
    """
    filtered_fields = []
    value_holder = []
    filtered_returning = []
    values = []

    for column in self._columns:
      if column['column_name'] in fields:
        filtered_fields.append(column['column_name'])
        value_holder.append('%s')
        values.append(fields[column['column_name']])
      if column['column_name'] in returning:
        filtered_returning.append(column['column_name'])

    query = f"""
      INSERT INTO {self._name}
      ({', '.join(filtered_fields)})
      VALUES ({', '.join(value_holder)})
      {generate_return_statement(filtered_returning)};
    """
    res = self._database.exec_commit(query, values)
    if res is None: return None
    return self.parse_obj(res, filtered_returning)

  def update(self, fields:dict={}, where:dict={}, returning:list=[]):
    """
      Update table field value(s) according to WHERE mapping (default all entities).
      Optionally return updated fields if specified in list.
    """
    filtered_fields = []
    filtered_where = []
    filtered_returning = []
    values = []

    for column in self._columns:
      if column['column_name'] in fields:
        filtered_fields.append(column['column_name'] + '=%s')
        values.append(fields[column['column_name']])
      if column['column_name'] in where:
        filtered_where.append(column['column_name'] + '=%s')
        values.append(where[column['column_name']])
      if column['column_name'] in returning:
        filtered_returning.append(column['column_name'])

    query = f"""
      UPDATE {self._name}
      SET {', '.join(filtered_fields)}
      {generate_where_clause(filtered_where)}
      {generate_return_statement(filtered_returning)};
    """
    return self._database.exec_commit(query, values)