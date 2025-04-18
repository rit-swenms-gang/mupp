import random

rounds = 3
max_group_size = 5
num_questions = 5
question_weights = [5, 2, 1, 1, 1]

total_weights = 0
for weight in question_weights:
    total_weights += weight


class Leader:  # Leader class
    def __init__(self, name, email, preference_list):
        self.name = name
        self.email = email
        self.preference_list = preference_list

        self.slots_open = max_group_size * rounds

        self.schedule = []
        for i in range(rounds):
            self.schedule.append([])

        self.matches = []
        for j in range(total_weights):
            self.matches.append([])

    def match_participant(self, participant, weights):
        match_score = 0  # the overall score of how many questions matched up
        for i in range(len(self.preference_list)):
            if self.preference_list[i] == participant.preference_list[i]:
                match_score += 1 * weights[i]
        return match_score

    def clear_schedule(self):
        self.schedule = []
        for i in range(rounds):
            self.schedule.append([])
        self.slots_open = max_group_size * rounds

    def schedule_participant(self, round_number, participant):
        self.schedule[round_number].append(participant)
        self.slots_open -= 1


class Participant:  # Participant class

    def __init__(self, name, email, preference_list):
        self.name = name
        self.email = email
        self.preference_list = preference_list

        self.schedule = [None] * rounds
        self.rounds_scheduled = 0

    def clear_schedule(self):
        self.schedule = [None] * rounds
        self.rounds_scheduled = 0

    def schedule_round(self, round_number, leader):
        self.schedule[round_number] = leader
        self.rounds_scheduled += 1


def generate_matches(leaders, participants, weights):
    for leader in leaders:
        for participant in participants:
            match_score = leader.match_participant(participant, weights)
            leader.matches[match_score].append(participant)


def tier_list_optimized_generator(leaders, participants):
    generation_complete = False
    total_slots_available = len(participants) * rounds
    round_matching_order = []
    for i in range(rounds):
        round_matching_order.append(i)

    while not generation_complete:
        total_slots_scheduled = 0
        k = 0

        for participant in participants:
            participant.clear_schedule()

        for leader in leaders:
            leader.clear_schedule()

        while (k < total_slots_available) and (not generation_complete):
            k += 1
            for i in range(total_weights - 1, -1, -1):
                random.shuffle(leaders)
                for leader in leaders:
                    random.shuffle(leader.matches[i])
                    for participant in leader.matches[i]:
                        if (
                            (participant.rounds_scheduled < rounds)
                            and (leader not in participant.schedule)
                            and leader.slots_open > 0
                        ):
                            random.shuffle(round_matching_order)
                            for round in round_matching_order:
                                if (
                                    (len(leader.schedule[round]) < max_group_size)
                                    and (participant.schedule[round] == None)
                                    and (leader not in participant.schedule)
                                ):
                                    leader.schedule_participant(round, participant)
                                    participant.schedule_round(round, leader)
                                    total_slots_scheduled += 1
        if total_slots_scheduled == total_slots_available:
            generation_complete = True


def p_sch_name_conversion(participant_schedule):
    name_schedule = []
    for leader in participant_schedule:
        name_schedule.append(leader.name)
    return name_schedule


def l_sch_name_conversion(leader_schedule):
    name_schedule = leader_schedule
    for i in range(len(name_schedule)):
        for j in range(len(name_schedule[i])):
            name_schedule[i][j] = name_schedule[i][j].name
    return name_schedule


def output_schedule(leaders, participants):
    schedule_dict = {}
    for leader in leaders:
        schedule_dict[leader.name] = l_sch_name_conversion(leader.schedule)
    for participant in participants:
        schedule_dict[participant.name] = p_sch_name_conversion(participant.schedule)
    return schedule_dict


def gene_evaluator(gene, weights):
    total_match_score = 0
    for leader, schedule in gene.items():
        for round in schedule:
            for participant in round:
                total_match_score += leader.match_participant(participant, weights)
    return total_match_score


def generate_parent(leaders, participants):
    parent = {}
    i = 0
    for leader in leaders:
        i += 1
        parent[leader] = leader.schedule
    return parent


def gene_to_schedule(gene, leaders, participants):
    for participant in participants:
        participant.clear_schedule()

    for leader in leaders:
        leader.clear_schedule()

    for leader, schedule in gene.items():
        for i in range(len(schedule)):
            for participant in schedule[i]:
                leader.schedule_participant(i, schedule[i])
                participant.schedule_round(i, leader)


def genetic_optimizer(leaders, participants, weights):
    max_score = 0
    optimal_gene = []
    secondary_parent = []
    generation_size = 10
    iterations = 10
    generate_matches(leaders, participants, weights)
    generation = []

    for i in range(generation_size):
        generation.append(generate_parent(leaders, participants))

    for i in range(iterations):
        for gene in generation:
            score = gene_evaluator(gene, weights)
            if score > max_score:
                max_score = score
                optimal_gene = gene
            # ...

    gene_to_schedule(optimal_gene, leaders, participants)
