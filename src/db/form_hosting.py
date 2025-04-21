from .utils.db import Database
import json


def format_table_name(uuid: str) -> str:
    "Prefix has with 'f' and remove hyphens from uuid for PostgreSQL"
    # TODO: Add more tests to verify name integrity
    return "f" + uuid.replace("-", "")


def generate_form_table(db: Database, form_id: str) -> None:
    """This will generate a form table based on the form_structure"""
    table_name = format_table_name(form_id)

    form_structure_row = db.select(
        "SELECT form_structure FROM hosted_forms WHERE id=%s", (form_id,)
    )

    if not form_structure_row:
        raise ValueError(f"Form {form_id} not found")

    form_structure = json.loads(form_structure_row[0][0])

    columns = []
    for entity in form_structure['entities'].values():
        type = entity['type']
        label = entity['attributes']['label']
        required = entity['attributes'].get('required',False)
        if type == 'textField':
            pg_type = 'VARCHAR'
        elif type == 'boolean':
            pg_type = 'BOOLEAN'
        elif type == 'numberScale':
            pg_type = 'INT'
        else:
            pg_type = "VARCHAR"

        columns.append(f"{label.lower()} {pg_type}{" NOT NULL" if required else ""}")

    create_query = f"""
        CREATE TABLE {table_name} (
            id SERIAL PRIMARY KEY,
            {',\n'.join(columns)}
        );
    """

    db.exec_commit(create_query)
    db.fetch_tables()
