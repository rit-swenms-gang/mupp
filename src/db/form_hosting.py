from .utils.db import Database
import json
import re
from .MatchingAlgorithms import Leader, Participant, generate_matches, tier_list_optimized_generator, output_schedule


def format_table_name(uuid: str) -> str:
    "Prefix has with 'f' and remove hyphens from uuid for PostgreSQL"
    # TODO: Add more tests to verify name integrity
    return "f" + uuid.replace("-", "")


def generate_form_table(db: Database, form_id: str):
    """This will generate a form table based on the form_structure"""
    table_name = format_table_name(form_id)

    form_structure_row = db.select(
        "SELECT form_structure FROM hosted_forms WHERE id=%s", (form_id,)
    )

    if not form_structure_row:
        raise ValueError(f"Form {form_id} not found")

    form_structure = json.loads(form_structure_row[0][0])

    columns = []
    uuid_to_col = {}

    for uuid, entity in form_structure['entities'].items():
        entity_type = entity['type']
        label = entity['attributes']['label']
        safe_label = re.sub(r'\W+', '_', label.lower()).strip('_')  # sanitize to valid SQL identifier
        uuid_to_col[uuid] = safe_label
        required = entity['attributes'].get('required',False)
        if entity_type == 'textField':
            pg_type = 'VARCHAR'
        elif type == 'boolean':
            pg_type = 'BOOLEAN'
        elif type == 'numberScale':
            pg_type = 'INT'
        else:
            pg_type = "VARCHAR"

        columns.append(f"{safe_label} {pg_type}{' NOT NULL' if required else ''}")
    create_query = """
        CREATE TABLE {} (
            id SERIAL PRIMARY KEY,
            {}
        );
    """.format(table_name, ',\n'.join(columns))

    db.exec_commit(create_query)
    db.fetch_tables()
    return uuid_to_col

def get_uuid_to_column_map(db: Database, form_id: str) -> dict:
    """Reconstructs the UUID-to-column-name mapping from a form_id's structure"""
    form_structure_row = db.select(
        "SELECT form_structure FROM hosted_forms WHERE id=%s", (form_id,)
    )
    if not form_structure_row:
        raise ValueError("Form not found")

    form_structure = json.loads(form_structure_row[0][0])
    uuid_to_col = {}

    for uuid, entity in form_structure['entities'].items():
        label = entity['attributes']['label']
        safe_label = re.sub(r'\W+', '_', label.lower()).strip('_')
        uuid_to_col[uuid] = safe_label

    return uuid_to_col

def generate_groupings_for_form(db: Database, form_id: str) -> dict:
    table_name = format_table_name(form_id)
    uuid_to_col = get_uuid_to_column_map(db, form_id)
    rows = db.tables[table_name].select()

    # Infer key fields
    leader_qid = next((uuid for uuid, col in uuid_to_col.items() if 'leader' in col), None)
    name_qid = next((uuid for uuid, col in uuid_to_col.items() if 'name' in col), None)
    email_qid = next((uuid for uuid, col in uuid_to_col.items() if 'email' in col), None)
    answer_qids = [uuid for uuid in uuid_to_col if uuid not in {name_qid, email_qid, leader_qid}]

    leaders, participants = [], []

    for row in rows:
        name = row[uuid_to_col[name_qid]]
        email = row[uuid_to_col[email_qid]]
        is_leader = str(row[uuid_to_col[leader_qid]]).strip().lower() in ("true", "1", "yes")
        answers = [row[uuid_to_col[qid]] for qid in answer_qids]

        if is_leader:
            leaders.append(Leader(name, email, answers))
        else:
            participants.append(Participant(name, email, answers))

    print(f"Leaders: {[l.name for l in leaders]}")
    print(f"Participants: {[p.name for p in participants]}")

    weights = [5] * len(answer_qids)

    for leader in leaders:
        for participant in participants:
            score = leader.match_participant(participant, weights)
            print(f"{leader.name} vs {participant.name} = {score}")

    generate_matches(leaders, participants, weights)
    tier_list_optimized_generator(leaders, participants)
    return output_schedule(leaders, participants)