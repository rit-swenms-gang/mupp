import unittest
from src.MatchingAlgorithms import *

class TestMatchingSystem(unittest.TestCase):
    
    def setUp(self):
        self.leader1 = Leader("Andrew", "andrew@example.com", [2, 0, 1, 3, 2])
        self.leader2 = Leader("Shahmir", "shahmir@example.com", [1, 3, 0, 2, 1])
        self.leader3 = Leader("JoJo", "jojo@example.com", [3, 2, 3, 0, 1])
        self.leader4 = Leader("Christian", "christian@example.com", [0, 1, 2, 3, 0])
        self.leader5 = Leader("Tyler", "tyler@example.com", [2, 3, 1, 1, 3])
        self.leaders = [self.leader1, self.leader2, self.leader3, self.leader4, self.leader5]

        self.participants = [
            Participant("Kermit", "kermit@themuppets.com", [2, 1, 3, 0, 1]),
            Participant("Miss Piggy", "miss.piggy@themuppets.com", [3, 2, 0, 1, 3]),
            Participant("Fozzie", "fozzie@themuppets.com", [0, 1, 2, 2, 1]),
            Participant("Gonzo", "gonzo@themuppets.com", [1, 3, 3, 0, 2]),
            Participant("Animal", "animal@themuppets.com", [2, 0, 1, 3, 3]),
            Participant("Beaker", "beaker@themuppets.com", [3, 3, 2, 1, 0]),
            Participant("Dr. Bunsen", "bunsen@themuppets.com", [1, 0, 2, 2, 3]),
            Participant("Rowlf", "rowlf@themuppets.com", [0, 2, 1, 1, 0]),
            Participant("Statler", "statler@themuppets.com", [2, 1, 0, 3, 2]),
            Participant("Waldorf", "waldorf@themuppets.com", [3, 2, 1, 0, 1]),
            Participant("Scooter", "scooter@themuppets.com", [1, 2, 3, 0, 1]),
            Participant("Rizzo", "rizzo@themuppets.com", [0, 3, 2, 1, 3]),
            Participant("Pepe", "pepe@themuppets.com", [2, 1, 1, 3, 0]),
            Participant("Sam Eagle", "sam.eagle@themuppets.com", [3, 0, 2, 2, 1]),
            Participant("Swedish Chef", "chef@themuppets.com", [1, 3, 0, 1, 2]),
            Participant("Lew Zealand", "lew@themuppets.com", [0, 2, 3, 3, 0]),
            Participant("Camilla", "camilla@themuppets.com", [2, 0, 1, 2, 3]),
            Participant("Dr. Teeth", "dr.teeth@themuppets.com", [3, 1, 0, 0, 2]),
            Participant("Zoot", "zoot@themuppets.com", [1, 2, 2, 1, 3]),
            Participant("Janice", "janice@themuppets.com", [0, 3, 1, 3, 2])
        ]

        self.weights = [5, 2, 1, 1, 1]
        
    def test_match_scores_are_within_expected_range(self):
        for leader in self.leaders:
            for participant in self.participants:
                score = leader.matchParticipant(participant, self.weights)
                self.assertGreaterEqual(score, 0)
                self.assertLessEqual(score, sum(self.weights))

    def test_generate_matches_fills_leader_matches(self):
        generateMatches(self.leaders, self.participants, self.weights)
        for leader in self.leaders:
            total_matched = sum(len(match) for match in leader.matches)
            self.assertEqual(total_matched, len(self.participants))

    def test_schedule_runs_to_completion(self):
        generateMatches(self.leaders, self.participants, self.weights)
        tierListOptimizedGenerator(self.leaders, self.participants)
        total_slots_filled = sum(p.roundsScheduled for p in self.participants)
        expected_slots = len(self.participants) * rounds
        self.assertEqual(total_slots_filled, expected_slots)

    def test_leader_schedule_constraints(self):
        generateMatches(self.leaders, self.participants, self.weights)
        tierListOptimizedGenerator(self.leaders, self.participants)
        for leader in self.leaders:
            for session in leader.schedule:
                self.assertLessEqual(len(session), maxGroupSize)

    def test_participant_schedule_constraints(self):
        generateMatches(self.leaders, self.participants, self.weights)
        tierListOptimizedGenerator(self.leaders, self.participants)
        for participant in self.participants:
            print(participant.name)
            self.assertEqual(len([s for s in participant.schedule if s is not None]), rounds)

if __name__ == '__main__':
    unittest.main()
