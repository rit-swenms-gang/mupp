import psycopg2
import yaml
import os.path as path
from .table import Table

class Database():
  @staticmethod
  def connect():
    """Connect to the database with data from ~/config/db.yml"""
    # credit swen610_db_utils
    config = {}
    yml_path = path.join(path.dirname(__file__), 
                         '../../../config/db.yml')
    with open(yml_path, 'r') as file:
      config = yaml.load(file, Loader=yaml.FullLoader)
    return psycopg2.connect(dbname=config['database'],
                            user=config['user'],
                            password=config['password'],
                            host=config['host'],
                            port=config['port'])
  
  def __init__(self, schema_name: str):
    self._conn = None
    self._schema = None
    self._tables = None
    self.open(schema_name)

  def cleanup(self, drop_schema=False):
    """
    Close the database connection, drop
    the current schema if specified
    """
    if drop_schema and self._schema is not None:
      if self._conn.closed != 0:
        self.open()
      with self._conn.cursor() as cursor:
        cursor.execute('DROP SCHEMA IF EXISTS {} CASCADE;'
                        .format(self._schema))
      self._conn.commit()
    if self._conn and self._conn.closed == 0:
      self.close()

  def open(self, schema:str=None):
    """Start a new psycopg2 connection if not running"""
    if self._conn is None or self._conn.closed != 0:
      self._conn = self.connect()
      self.set_schema(schema or self._schema)
    else: raise Exception('Connection is already open')

  def set_schema(self, schema:str=None):
    """Set the Postgres `search_path` to a schema"""
    if schema is not None:
      self._schema = schema
    if self._schema is None: return
    with self._conn.cursor() as c:
      c.execute('CREATE SCHEMA IF NOT EXISTS %s;' 
                % self._schema)
      c.execute('SET search_path TO {};'
                .format(self._schema))
      # c.execute('SET search_path TO {},public;'
      #           .format(self._schema))
    self._conn.commit()
    self.fetch_tables()

  def fetch_tables(self):
    """Retrieve tables and columns from database"""
    with self._conn.cursor() as c:
      c.execute("""
        SELECT
          JSON_OBJECT_AGG(
            c1.table_name, 
            (SELECT 
              ARRAY_AGG(JSON_BUILD_OBJECT(
                'ordinal_position', ordinal_position,
                'column_name', column_name, 
                'type', data_type, 
                'default', column_default, 
                'nullable', is_nullable != 'NO',
                'schema', table_schema
              ))
            FROM information_schema.columns
            WHERE table_name = c1.table_name
            AND table_schema = %s
            )
          )
        FROM information_schema.columns c1
        WHERE table_schema = %s;
      """, (self._schema, self._schema)
      )
      tables = c.fetchone()[0]
      if tables is not None:
        for name in tables:
          tables[name] = Table(name, tables[name], self)
      self._tables = tables
    self._conn.rollback()

  @property
  def tables(self) -> dict[str, Table] | None:
    return self._tables

  def close(self):
    """Close existing psycopg2 connection"""
    if self._conn.closed == 0:
      self._conn.close()
    else: raise Exception('Connection is already closed')

  def exec_sql_file(self, file: str): 
    """Read a SQL file into the database"""
    # start from root dir, credit swen610_db_utils.py
    abs_path = path.join(path.dirname(__file__), 
                         f'../../../{file}') 
    # TODO: should closed connects raise exception
    # or just work automatically?
    if self._conn.closed != 0: self.open()
    with self._conn.cursor() as cursor:
      with open(abs_path, 'r') as file:
        cursor.execute(file.read())
    self._conn.commit()

  def select(self, query: str, args=None, number: int | None = None):
    """
    Retrieve results of query from database. 
    Supports both dict or tuple/list arguments.
    Does *not* commit.
    """
    result = None
    with self._conn.cursor() as cursor:
        if args:
            cursor.execute(query, args)
        else:
            cursor.execute(query)

        if number is None:
            result = cursor.fetchall()
        elif number == 1:
            result = cursor.fetchone()
        elif number > 1:
            result = cursor.fetchmany(number)
        else:
            raise ValueError(f'{number} is not a positive integer.')
    self._conn.rollback()
    return result
  
  def exec_commit(self, query: str, args=None):
    """
    Execute a query, commit to the database, and return the result.
    Supports both dict or tuple/list arguments.
    On exceptions, rollback transaction and raise error.
    """
    result = None
    with self._conn.cursor() as c:
        try:
            if args:
                c.execute(query, args)
            else:
                c.execute(query)
            result = c.fetchall()
        except Exception as err:
            if err.args[0] != 'no results to fetch':
                self._conn.rollback()
                raise err
    self._conn.commit()
    return (result if result is None or len(result) != 1 else result[0])
