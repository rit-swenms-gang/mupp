from .utils.db import Database
import json


def format_table_name(uuid: str) -> str:
    "Prefix has with 'f' and remove hyphens from uuid for PostgreSQL"
    # TODO: Add more tests to verify name integrity
    return "f" + uuid.replace("-", "")


def generate_form_table(db: Database, form_id: str) -> None:
    table_name = format_table_name(form_id)

    form_structure_row = db.select(
        "SELECT form_structure FROM hosted_forms WHERE id=%s", (form_id,)
    )

    if not form_structure_row:
        raise ValueError(f"Form {form_id} not found")

    form_structure = json.loads(form_structure_row[0][0])

    columns = []
    for field, field_type in form_structure.items():
        if isinstance(field_type, str):
            pg_type = {
                "text": "TEXT",
                "json": "JSON",
                "int": "INTEGER",
                "float": "REAL",
                "bool": "BOOLEAN",
            }.get(field_type, "TEXT")
        else:
            pg_type = "TEXT"

        columns.append(f"{field} {pg_type}")

    create_query = f"""
        CREATE TABLE {table_name} (
            id SERIAL PRIMARY KEY,
            {', '.join(columns)}
        );
    """

    db.exec_commit(create_query)
    db.fetch_tables()
