from .utils.db import Database

def format_table_name(uuid: str) -> str:
  "Prefix has with 'f' and remove hyphens from uuid for PostgreSQL"
  # TODO: Add more tests to verify name integrity
  return 'f' + uuid.replace('-','')

def generate_form_table(db: Database, uuid: str) -> None:
  """
  Take a uuid representing a hosted_form id in database and add a new table for form data.
  Remove table name disallowed characters before insertion.
  """
  # TODO: This may have a potential scaling issue if there's a sufficiently large number of tables
  # Maybe consider sharding in that eventuality
  try:
    db.exec_commit("""
      CREATE TABLE {}(
        id SERIAL PRIMARY KEY,
        test VARCHAR
      );
    """.format(format_table_name(uuid)))
    db.fetch_tables()
  except Exception as e:
    raise e