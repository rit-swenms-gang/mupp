import unittest
from src.db.MatchingAlgorithms import (
    Leader,
    Participant,
    generate_matches,
    generate_parent,
    tier_list_optimized_generator,
    p_sch_name_conversion,
    l_sch_name_conversion,
    output_schedule,
    gene_to_schedule,
    gene_evaluator,
    rounds,
    max_group_size,
    min_group_size_calc,
    TMSCalc,
    max_group_size_calc,
    group_size_avg_calc,
    min_match_score_calc,
    check_valid_gene,
    mutation,
    crossover,
    genetic_optimizer,
)


class TestMatchingSystem(unittest.TestCase):

    def setUp(self):  # Initialize the data
        self.leader1 = Leader("Andrew", "andrew@example.com", [2, 0, 1, 3, 2])
        self.leader2 = Leader("Shahmir", "shahmir@example.com", [1, 3, 0, 2, 1])
        self.leader3 = Leader("JoJo", "jojo@example.com", [3, 2, 3, 0, 1])
        self.leader4 = Leader("Christian", "christian@example.com", [0, 1, 2, 3, 0])
        self.leader5 = Leader("Tyler", "tyler@example.com", [2, 3, 1, 1, 3])
        self.leaders = [
            self.leader1,
            self.leader2,
            self.leader3,
            self.leader4,
            self.leader5,
        ]

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
            Participant("The count", "TheCount@notthemuppets.com", [3, 1, 0, 0, 2]),
            Participant("Zoot", "zoot@themuppets.com", [1, 2, 2, 1, 3]),
            Participant("Janice", "janice@themuppets.com", [0, 3, 1, 3, 2]),
        ]

        self.weights = [5, 2, 1, 1, 1]

    def test_match_scores_are_within_expected_range(
        self,
    ):  # this tests the individual matches between leaders and participants and ensures they're within the correct range
        for leader in self.leaders:
            for participant in self.participants:
                score = leader.match_participant(participant, self.weights)
                self.assertGreaterEqual(score, 0)
                self.assertLessEqual(score, sum(self.weights))

    def test_generate_matches_fills_leader_matches(
        self,
    ):  # this test makes sure that the tier list used for optimization is full
        generate_matches(self.leaders, self.participants, self.weights)
        for leader in self.leaders:
            total_matched = sum(len(match) for match in leader.matches)
            self.assertEqual(total_matched, len(self.participants))

    def test_leader_schedule_constraints(
        self,
    ):  # This ensures that no leader gets overscheduled
        generate_matches(self.leaders, self.participants, self.weights)
        tier_list_optimized_generator(self.leaders, self.participants)
        for leader in self.leaders:
            for session in leader.schedule:
                self.assertLessEqual(len(session), max_group_size)

    def test_schedule_runs_to_completion(
        self,
    ):  # This checks that the schedule is fully complete after running the generation
        generate_matches(self.leaders, self.participants, self.weights)
        tier_list_optimized_generator(self.leaders, self.participants)
        total_slots_filled = sum(p.rounds_scheduled for p in self.participants)
        expected_slots = len(self.participants) * rounds
        self.assertEqual(total_slots_filled, expected_slots)

    def test_participant_schedule_constraints(
        self,
    ):  # This makes sure that the participants don't get overbooked
        generate_matches(self.leaders, self.participants, self.weights)
        tier_list_optimized_generator(self.leaders, self.participants)
        for participant in self.participants:
            self.assertEqual(
                len([s for s in participant.schedule if s is not None]), rounds
            )

    def test_p_sch_name_conversion(
        self,
    ):  # this tests the conversion of the player schedule with instances of the player class to their names
        self.participants[0].schedule = [self.leader1, self.leader2, self.leader3]
        result = p_sch_name_conversion(self.participants[0].schedule)
        self.assertEqual(result, ["Andrew", "Shahmir", "JoJo"])

    def test_l_sch_name_conversion(self):  # This does the same, but for leaders
        self.leader1.schedule = [
            [self.participants[0], self.participants[1]],
            [self.participants[2]],
            [],
        ]
        result = l_sch_name_conversion(self.leader1.schedule)
        expected = [["Kermit", "Miss Piggy"], ["Fozzie"], []]
        self.assertEqual(result, expected)

    def test_outputSchedule(
        self,
    ):  # This tests how to ensure that the returned version of the schedule is what is expected from the input data
        self.participants[0].schedule = [self.leader1, self.leader2, self.leader3]
        self.participants[1].schedule = [self.leader2, self.leader3, self.leader4]

        self.leader1.schedule[0].append(self.participants[0])
        self.leader2.schedule[1].append(self.participants[0])
        self.leader2.schedule[0].append(self.participants[1])
        self.leader3.schedule[2].append(self.participants[1])

        result = output_schedule(
            [self.leader1, self.leader2, self.leader3], self.participants[:2]
        )
        self.assertIn("Kermit", result)
        self.assertIn("Miss Piggy", result)
        self.assertIn("Andrew", result)

    def test_gene_evaluator(
        self,
    ):  # This tests the function used to evaluate iterations of the genetic algorithm
        leader = self.leader1
        participant = self.participants[0]
        score = leader.match_participant(participant, self.weights)
        gene = {leader: [[participant], [], []]}
        evaluated = gene_evaluator(gene, self.weights)
        self.assertEqual(evaluated, score)

    def test_generate_parent(
        self,
    ):  # This tests the parent generation code for the genetic algorithm
        parent = generate_parent(self.leaders)
        self.assertIsInstance(parent, dict)
        self.assertEqual(set(parent.keys()), set(self.leaders))
        for schedule in parent.values():
            self.assertEqual(len(schedule), rounds)

    def test_gene_to_schedule(
        self,
    ):  # This tests if the conversion from a gene into a specified schedule works
        parent = generate_parent(self.leaders)
        gene_to_schedule(parent, self.leaders, self.participants)
        for leader in self.leaders:
            self.assertEqual(leader.schedule, parent[leader])
            
    def test_min_group_size_calc(self):
        # This tests that the minimum group size function works
        gene = {
            self.leader1: [[self.participants[0]], [self.participants[1], self.participants[2]], []],
            self.leader2: [[self.participants[3], self.participants[4]], [], [self.participants[5]]],
            self.leader3: [[], [], [self.participants[6], self.participants[7], self.participants[8]]]
        }

        min_size = min_group_size_calc(gene)
        self.assertEqual(min_size, 0)
        
    def test_TMSCalc(self):
        # Tests that TMSCalc returns the correct total match score for a simple schedule
        leader = self.leader1
        participants = self.participants[:3]
        gene = {
            leader: [participants, [], []]
        }
        expected_score = sum(leader.match_participant(p, self.weights) for p in participants)
        self.assertEqual(TMSCalc(gene, self.weights), expected_score)
    
    def test_min_group_size_calc(self):
        # Tests that min_group_size_calc returns the correct minimum group size in a schedule
        leader = self.leader1
        participants = self.participants
        gene = {
            leader: [participants[:2], participants[2:4], participants[4:]]
        }
        self.assertEqual(min_group_size_calc(gene), 2)
        
    def test_max_group_size_calc(self):
        # Tests that max_group_size_calc returns the correct maximum group size in a schedule
        leader = self.leader1
        participants = self.participants
        gene = {
            leader: [participants[:3], participants[3:4], participants[4:6]]
        }
        self.assertEqual(max_group_size_calc(gene), 3)
    
    def test_group_size_avg_calc(self):
        # Tests that group_size_avg_calc returns the correct average group size in a schedule
        leader = self.leader1
        participants = self.participants
        gene = {
            leader: [participants[:2], participants[2:4], participants[4:6]]
        }
        self.assertEqual(group_size_avg_calc(gene), 2.0)
    
    def test_min_match_score_calc(self):
        # Tests that min_match_score_calc returns the minimum match score in a schedule
        leader = self.leader1
        participants = self.participants
        gene = {
            leader: [
                [participants[0], participants[1]],
                [participants[2], participants[3]],
                [participants[4]]
            ]
        }
        self.assertEqual(min_match_score_calc(gene), 0)
        
    def test_check_valid_gene(self):
        # Tests that check_valid_gene correctly identifies valid and invalid genes
        valid_gene = {
            self.leader1: [[self.participants[0], self.participants[1]], [], []],
            self.leader2: [[self.participants[2], self.participants[3]], [], []]
        }
        invalid_gene = {
            self.leader1: [[self.participants[0], self.participants[1]], [], []],
            self.leader2: [[self.participants[0], self.participants[3]], [], []]  # Duplicate participant
        }
        self.assertTrue(check_valid_gene(valid_gene))
        self.assertFalse(check_valid_gene(invalid_gene))

    def test_mutation(self):
        # Tests that mutation correctly alters a gene without violating validity
        gene = {
            self.leader1: [[self.participants[0], self.participants[1]], [], []],
            self.leader2: [[self.participants[2], self.participants[3]], [], []]
        }
        mutated_gene = mutation(gene)
        self.assertNotEqual(mutated_gene, gene)  # The gene should be mutated
        self.assertTrue(check_valid_gene(mutated_gene))  # The mutated gene should still be valid
    
    def test_crossover(self):
        # Tests that crossover correctly combines two genes and maintains validity
        gene_one = {
            self.leader1: [[self.participants[0], self.participants[1]], [], []],
            self.leader2: [[self.participants[2], self.participants[3]], [], []]
        }
        gene_two = {
            self.leader1: [[self.participants[4], self.participants[5]], [], []],
            self.leader2: [[self.participants[6], self.participants[7]], [], []]
        }
        child_gene = crossover(gene_one, gene_two)
        self.assertNotEqual(child_gene, gene_one) 
        self.assertNotEqual(child_gene, gene_two) 
        self.assertTrue(check_valid_gene(child_gene))  


    def test_genetic_optimizer(self):
        # Tests that genetic_optimizer generates a valid optimal gene
        generate_matches(self.leaders, self.participants, self.weights)
        tier_list_optimized_generator(self.leaders, self.participants)
        optimal_gene = genetic_optimizer(self.leaders, self.participants, self.weights)
        self.assertIsInstance(optimal_gene, dict)  
        self.assertTrue(all(isinstance(leader, Leader) for leader in optimal_gene))   
    

if __name__ == "__main__":
    unittest.main()
