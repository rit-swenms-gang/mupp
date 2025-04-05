from .utils.db import Database

def generate_form_table(db: Database, uuid: str) -> None:
  """
  Take a uuid representing a hosted_form id in database and add a new table to for forms schema.
  Remove table name disallowed characters before insertion.
  """
  # TODO: This may have a potential scaling issue if there's a sufficiently large number of tables
  # Maybe consider sharding in that eventuality
  try:
    # db.set_schema('forms') # Consider additional table schema
    db.exec_commit("""
      CREATE TABLE f{}(
        id SERIAL PRIMARY KEY,
        test VARCHAR
      );
    """.format(uuid.replace('-','')))
    db.fetch_tables()
  except Exception as e:
    raise e