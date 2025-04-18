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
from src.db.form_hosting import format_table_name
import random


class TestMatchingWithFormSubmission(TestCase):
    def setUp(self):
        self.db = Database("test")
        self.db.cleanup(True)
        self.db.exec_sql_file("config/demo_db_setup.sql")
        self.db.fetch_tables()
        self.account_id = self.db.exec_commit(
            """
            INSERT INTO accounts (username, email, password, salt)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
            """,
            ("matchadmin", "matchadmin@test.com", "password", "salt"),
        )[0]

        self.session_key = "form_session"

        self.db.exec_commit(
            """
            INSERT INTO logins(user_id, session_key)
            VALUES (%s, %s)
            """,
            (self.account_id, self.session_key),
        )

        self.form_structure = {"name": "text", "email": "text", "answers": "integer[]"}
        form_data = {
            "account_id": self.account_id,
            "form_structure": self.form_structure,
        }

        result = test_post(
            self,
            "http://localhost:5001/forms",
            json=form_data,
            header={"session-key": "form_session"},
            expected_status=201,
        )
        self.form_id = result.get("form_endpoint")

        self.db.fetch_tables()
        self.table_name = format_table_name(self.form_id)

        # Seed data for Leaders
        self.leaders = [
            Leader("Tyler", "Tyler@mupp.com", [2, 0, 1, 3, 2]),
            Leader("Shahmir", "Shahmir@mupp.com", [1, 3, 2, 1, 2]),
            Leader("JoJo", "JoJo@mupp.com", [2, 0, 3, 3, 2]),
            Leader("Christian", "Christian@mupp.com", [1, 3, 1, 2, 2]),
            Leader("Andrew", "Andrew@mupp.com", [1, 0, 1, 3, 2]),
            Leader("Evan", "Evan@mupp.com", [0, 3, 1, 3, 0]),
        ]
        self.weights = [5, 2, 1, 1, 1]

    def tearDown(self):
        self.db.cleanup(True)

    def test_end_to_end_form_submission_to_matching(self):
        """Testing form submissions"""
        names = [
            "Kermit",
            "Miss Piggy",
            "Swedish Chef",
            "Pikachu",
            "Golden Freddy",
            "Freddy",
            "Bonnie",
            "Chica",
            "Foxy",
            "Snake",
        ]
        for name in names:
            answers = [random.randint(0, 3) for x in range(5)]

            self.db.tables[self.table_name].insert(
                {"name": name, "email": "test@mupp.com", "answers": answers}
            )

        """Get Rows -> Participant objects, and then match using algorithm, test if all participants are matched"""

        rows = self.db.tables[self.table_name].select()
        participants = [Participant(i["name"], i["email"], i["answers"]) for i in rows]

        generate_matches(self.leaders, participants, self.weights)
        tier_list_optimized_generator(self.leaders, participants)

        # for p in participants:
        #     print(p.schedule)

        for leader in self.leaders:
            for session in leader.schedule:
                self.assertLessEqual(len(session), max_group_size)
