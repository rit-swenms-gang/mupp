from unittest import TestCase
from src.MatchingAlgorithms import (
    max_group_size,
    Leader,
    Participant,
    tier_list_optimized_generator,
    generate_matches,
    output_schedule,
)
from tests.api.test_req_utils import test_post
from src.db.utils.db import Database
from src.db.form_hosting import generate_form_table, format_table_name
from json import dumps
import random
from pprint import pprint

MOCK_UUIDS = {
    "name_uuid": "name-uuid",
    "email_uuid": "email-uuid",
    "leader_uuid": "leader-uuid",
    "competitive_uuid": "competitive-uuid",
    "difficulty_uuid": "difficulty-uuid"
}

class TestMatchingWithDynamicForm(TestCase):
    def setUp(self):
        self.db = Database("test")
        self.db.cleanup(True)
        self.db.exec_sql_file("config/demo_db_setup.sql")

        self.account_id = self.db.exec_commit(
            "INSERT INTO accounts (username, email, password, salt) VALUES (%s, %s, %s, %s) RETURNING id;",
            ("formadmin", "formadmin@test.com", "pass", "salt")
        )[0]
        self.session_key = "form_session"
        self.db.exec_commit(
            "INSERT INTO logins(user_id, session_key) VALUES (%s, %s);",
            (self.account_id, self.session_key)
        )

        self.name_qid = MOCK_UUIDS["name_uuid"]
        self.email_qid = MOCK_UUIDS["email_uuid"]
        self.leader_qid = MOCK_UUIDS["leader_uuid"]
        self.q_competitive = MOCK_UUIDS["competitive_uuid"]
        self.q_difficulty = MOCK_UUIDS["difficulty_uuid"]
        self.answers_qid = [self.q_competitive, self.q_difficulty]

        form_structure = {
            "entities": {
                self.name_qid: {
                    "type": "textField",
                    "attributes": {"label": "Name", "required": True}
                },
                self.email_qid: {
                    "type": "textField",
                    "attributes": {"label": "Email"}
                },
                self.q_competitive: {
                    "type": "numberScale",
                    "attributes": {"label": "How competitive are you?", "min": 1, "max": 10}
                },
                self.q_difficulty: {
                    "type": "numberScale",
                    "attributes": {"label": "How easy do you want the game?", "min": 1, "max": 10}
                },
                self.leader_qid: {
                    "type": "boolean",
                    "attributes": {"label": "Are you a Group Leader?"}
                }
            },
            "root": [
                self.name_qid,
                self.email_qid,
                self.q_competitive,
                self.q_difficulty,
                self.leader_qid
            ]
        }

        self.form_id = self.db.exec_commit(
            "INSERT INTO hosted_forms (account_id, form_structure) VALUES (%s, %s) RETURNING id;",
            [self.account_id, dumps(form_structure)]
        )[0]

        self.table_name = format_table_name(self.form_id)
        self.uuid_to_col = generate_form_table(self.db, self.form_id)

    def tearDown(self):
        self.db.cleanup(True)

    def test_submission_to_matching(self):
        leaders, _ = self.run_matching_pipeline()
        for leader in leaders:
            for session in leader.schedule:
                self.assertLessEqual(len(session), max_group_size)

    def test_groupings_are_valid(self):
        """This will test if the groupings are valid, and if the requirements of a 'successful' grouping has been reached
            This means that all participants are grouped for 3 sessions, no participant is grouped with the same leader twice, and the group sizes are within the bounds for each round"""
        leaders, participants = self.run_matching_pipeline()

        for p in participants:
            self.assertEqual(
                p.rounds_scheduled, 3,
                f"{p.name} is not scheduled in all rounds."
            )

        for p in participants:
            unique_leaders = set(p.schedule)
            self.assertEqual(
                len(unique_leaders), len(p.schedule),
                f"{p.name} has duplicate leader assignments: {p.schedule}"
            )

        for l in leaders:
            for i, group in enumerate(l.schedule):
                self.assertLessEqual(
                    len(group), max_group_size,
                    f"{l.name} has an oversized group in round {i}: {[p.name for p in group]}"
                )

        for l in leaders:
            all_participants = [p.name for round in l.schedule for p in round]
            self.assertEqual(
                len(all_participants), len(set(all_participants)),
                f"{l.name} has duplicate participants in their schedule: {all_participants}"
            )

    def run_matching_pipeline(self):
        form_responses = []
        """Generating the Leaders' responses"""
        for i in range(1, 8):
            form_responses.append({
                self.name_qid: f"Leader{i}",
                self.email_qid: f"leader{i}@game.com",
                self.leader_qid: True,
                self.q_competitive: random.randint(1, 10),
                self.q_difficulty: random.randint(1, 10),
            })

        """Generating the participants"""
        for i in range(1, 21):
            form_responses.append({
                self.name_qid: f"Participant{i}",
                self.email_qid: f"participant{i}@game.com",
                self.leader_qid: False,
                self.q_competitive: random.randint(1, 10),
                self.q_difficulty: random.randint(1, 10),
            })
        
        for response in form_responses:
            sanitized = {self.uuid_to_col[k]: v for k, v in response.items() if k in self.uuid_to_col}
            self.db.tables[self.table_name].insert(sanitized)

        rows = self.db.tables[self.table_name].select()
        leaders, participants = [], []

        for row in rows:
            name = row[self.uuid_to_col[self.name_qid]]
            email = row[self.uuid_to_col[self.email_qid]]
            is_leader = row[self.uuid_to_col[self.leader_qid]]
            answers = [row[self.uuid_to_col[self.q_competitive]],
                       row[self.uuid_to_col[self.q_difficulty]]]

            if is_leader:
                leaders.append(Leader(name, email, answers))
            else:
                participants.append(Participant(name, email, answers))

        weights = [5, 2]
        generate_matches(leaders, participants, weights)
        tier_list_optimized_generator(leaders, participants)
        
        # groupings = output_schedule(leaders, participants)
        # pprint(groupings)
        return leaders, participants