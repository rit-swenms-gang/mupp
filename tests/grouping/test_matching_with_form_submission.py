from unittest import TestCase
from src.MatchingAlgorithms import (
    max_group_size,
    Leader,
    Participant,
    tier_list_optimized_generator,
    generate_matches,
)
from tests.api.test_req_utils import test_post
from src.db.utils.db import Database
from src.db.form_hosting import generate_form_table, format_table_name
from json import dumps
import random

class TestMatchingWithDynamicForm(TestCase):
    def setUp(self):
        self.db = Database("test")
        self.db.cleanup(True)
        self.db.exec_sql_file("config/demo_db_setup.sql")

        # Create account + session
        self.account_id = self.db.exec_commit(
            "INSERT INTO accounts (username, email, password, salt) VALUES (%s, %s, %s, %s) RETURNING id;",
            ("formadmin", "formadmin@test.com", "pass", "salt")
        )[0]
        self.session_key = "form_session"
        self.db.exec_commit(
            "INSERT INTO logins(user_id, session_key) VALUES (%s, %s);",
            (self.account_id, self.session_key)
        )

        # Create dynamic form with label-based answers
        self.name_qid = "name-uuid"
        self.email_qid = "email-uuid"
        self.leader_qid = "leader-uuid"
        self.q_competitive = "competitive-uuid"
        self.q_difficulty = "difficulty-uuid"
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

        # Add form to DB
        self.form_id = self.db.exec_commit(
            "INSERT INTO hosted_forms (account_id, form_structure) VALUES (%s, %s) RETURNING id;",
            [self.account_id, dumps(form_structure)]
        )[0]

        self.table_name = format_table_name(self.form_id)
        self.uuid_to_col = generate_form_table(self.db, self.form_id)

    def tearDown(self):
        self.db.cleanup(True)

    def test_submission_to_matching(self):
        """This will test if the matching algorithm generates the correct number of sessions"""
        leaders, _ = self.run_matching_pipeline()
        for leader in leaders:
            for session in leader.schedule:
                self.assertLessEqual(len(session), max_group_size)

    def test_groupings_are_valid(self):
        leaders, participants = self.run_matching_pipeline()

        # All participants are scheduled in all 3 rounds
        for p in participants:
            self.assertEqual(
                p.rounds_scheduled, 3,
                f"{p.name} is not scheduled in all rounds."
            )

        # No participant is matched with the same leader more than once
        for p in participants:
            unique_leaders = set(p.schedule)
            self.assertEqual(
                len(unique_leaders), len(p.schedule),
                f"{p.name} has duplicate leader assignments: {p.schedule}"
            )

        # No leader has more than max_group_size per round
        for l in leaders:
            for i, group in enumerate(l.schedule):
                self.assertLessEqual(
                    len(group), max_group_size,
                    f"{l.name} has an oversized group in round {i}: {[p.name for p in group]}"
                )

        # No leader has the same participant multiple times
        for l in leaders:
            all_participants = [p.name for round in l.schedule for p in round]
            self.assertEqual(
                len(all_participants), len(set(all_participants)),
                f"{l.name} has duplicate participants in their schedule: {all_participants}"
            )


    def run_matching_pipeline(self):
        """Added this so we can reuse the same mock data"""
        names = [
            ("Tyler", True), ("Shahmir", True), ("JoJo", True), ("Christian", True),
            ("Andrew", True), ("Evan", True),
        ]

        for i in range(1, 20):
            names.append((f"Participant{i}", False))

        for name, is_leader in names:
            response_data = {
                self.name_qid: name,
                self.email_qid: f"{name.lower()}@test.com",
                self.leader_qid: is_leader,
            }

            response_data[self.q_competitive] = random.randint(1, 10)
            response_data[self.q_difficulty] = random.randint(1, 10)

            sanitized_row = {
                self.uuid_to_col[k]: v for k, v in response_data.items() if k in self.uuid_to_col
            }
            self.db.tables[self.table_name].insert(sanitized_row)

        rows = self.db.tables[self.table_name].select()
        leaders, participants = [], []

        for row in rows:
            name = row[self.uuid_to_col[self.name_qid]]
            email = row[self.uuid_to_col[self.email_qid]]
            answers = [row[self.uuid_to_col[qid]] for qid in self.answers_qid]
            is_leader = row[self.uuid_to_col[self.leader_qid]]

            if is_leader:
                leaders.append(Leader(name, email, answers))
            else:
                participants.append(Participant(name, email, answers))

        weights = [5, 2]
        generate_matches(leaders, participants, weights)
        tier_list_optimized_generator(leaders, participants)
        return leaders, participants

        
       

