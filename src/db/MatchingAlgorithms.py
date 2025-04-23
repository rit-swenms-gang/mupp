import random
import copy

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
        for _ in range(rounds):
            self.schedule.append([])

        self.matches = []
        for _ in range(total_weights):
            self.matches.append([])

    def match_participant(self, participant, weights):
        match_score = 0  # the overall score of how many questions matched up
        for i in range(len(self.preference_list)):
            if self.preference_list[i] == participant.preference_list[i]:
                match_score += 1 * weights[i]
        return match_score

    def clear_schedule(self):
        self.schedule = []
        for _ in range(rounds):
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
    
    while(not generation_complete):
      total_slots_scheduled = 0
      k = 0
      
      for participant in participants:
        participant.clear_schedule()
      
      for leader in leaders:
        leader.clear_schedule()
          
      while((k < total_slots_available) and (not generation_complete)):
        k+=1
        for i in range(total_weights-1, -1, -1):
          random.shuffle(leaders)
          for leader in leaders:
            random.shuffle(leader.matches[i])
            for participant in leader.matches[i]:
              if((participant.rounds_scheduled < rounds) and (leader not in participant.schedule) and leader.slots_open > 0):
                random.shuffle(round_matching_order)
                for round in round_matching_order:
                  if((len(leader.schedule[round]) < max_group_size) and (participant.schedule[round] == None) and (leader not in participant.schedule)):
                    leader.schedule_participant(round, participant)
                    participant.schedule_round(round, leader)
                    total_slots_scheduled +=1
      if(total_slots_scheduled == total_slots_available):
        generation_complete = True
    
    return(genetic_optimizer)

def p_sch_name_conversion(participant_schedule):
  name_schedule = []
  for leader in participant_schedule:
    name_schedule.append(leader.name)
  return(name_schedule)
    
def l_sch_name_conversion(leader_schedule):
  name_schedule = leader_schedule
  for i in range(len(name_schedule)):
    for j in range(len(name_schedule[i])):
      name_schedule[i][j] = name_schedule[i][j].name
  return(name_schedule)

def output_schedule(leaders,participants):
  schedule_dict = {}
  for leader in leaders:
    schedule_dict[leader.name] = l_sch_name_conversion(leader.schedule) 
  for participant in participants:
    schedule_dict[participant.name] = p_sch_name_conversion(participant.schedule) 
  return(schedule_dict)
            
def gene_evaluator(gene,weights):
  TMSWeight = 1
  min_gSWeight = 0
  max_gSWeight = 0
  GSAvg_weight = 0
  min_mSWeight = 0
  
  return(TMSWeight*TMSCalc(gene,weights))

def TMSCalc(gene,weights):
  total_match_score = 0
  for leader, schedule in gene.items():
    for round in schedule:
      for participant in round:
        total_match_score += leader.match_participant(participant,weights)
  return(total_match_score)

def min_group_size_calc(gene):
    min_size = float('inf')
    for leader in gene:
        for round_group in gene[leader]:
            group_size = len(round_group)
            if group_size < min_size:
                min_size = group_size
    return min_size

def max_group_size_calc(gene):
    max_size = 0
    for leader in gene:
        for round_group in gene[leader]:
            group_size = len(round_group)
            if group_size > max_size:
                max_size = group_size
    return max_size

def group_size_avg_calc(gene):
    total = 0
    count = 0
    for leader in gene:
        for round_group in gene[leader]:
            total += len(round_group)
            count += 1
    if count == 0:
        return 0
    return total / count

def min_match_score_calc(gene):
    min_score = float('inf')
    for leader in gene:
        for round_group in gene[leader]:
            for participant in round_group:
                score = leader.match_participant(participant, question_weights)
                if score < min_score:
                    min_score = score
    return min_score
  
          
def generate_parent(leaders):
  parent = {}
  for leader in leaders:
    parent[leader] = leader.schedule
  return(parent)

def gene_to_schedule(gene,leaders,participants):
  for participant in participants:
    participant.clear_schedule()
    
  for leader in leaders:
    leader.clear_schedule()
    
  for leader, schedule in gene.items():
    for i in range(len(schedule)):
      for participant in schedule[i]:
        leader.schedule_participant(i,schedule[i])
        participant.schedule_round(i,leader)
        
def check_valid_gene(gene):
  found = []
  for schedule in gene.values():
    for round in schedule:
      for player in round:
        if ((player in found)):
          return(False)
        else:
          found.append(player)
  
  return(True)
    

def mutation(gene):
  mutated_gene = copy.deepcopy(gene)
  leaders = list(mutated_gene.keys())
  
  if not leaders: 
    return (mutated_gene)
  
  leader = random.choice(leaders)
  round_index = random.randint(0, rounds - 1)
  participants = mutated_gene[leader][round_index]
  
  if len(participants) >= 2:
    i, j = random.sample(range(len(participants)), 2)
    participants[i], participants[j] = participants[j], participants[i]
  
  if(check_valid_gene):  
    return (mutated_gene)
  else:
    return(gene)


def crossover(gene_one, gene_two):
  child = {}
  
  for leader in gene_one:
    child_schedule = []
    for r in range(rounds):
      if random.random() < 0.5:
        child_schedule.append(copy.deepcopy(gene_one[leader][r]))  
      else:
        child_schedule.append(copy.deepcopy(gene_one[leader][r]))
        
    child[leader] = child_schedule
  
  if check_valid_gene(child):
    return (child)
  else:
    if random.random() < 0.5:
      return(gene_one)
    else:
      return(gene_two)


      
def genetic_optimizer(leaders, participants, weights):
  max_score = 0
  optimal_gene = None
  generation_size = 10
  iterations = 10
  generate_matches(leaders, participants, weights)
  generation = []
  for _ in range(generation_size):
    generation.append(generate_parent(leaders))


  for j in range(iterations):
    scored_generation = []
    for gene in generation:
      scored_generation.append((gene, gene_evaluator(gene, weights)))

    scored_generation.sort(key=lambda x: x[1], reverse=True)
    
    if scored_generation[0][1] > max_score:
      max_score = scored_generation[0][1]
      optimal_gene = scored_generation[0][0]
    new_generation = [scored_generation[0][0], scored_generation[1][0]]
    
    while len(new_generation) < generation_size:
      parent_one = random.choice(scored_generation[:5])[0]
      parent_two = random.choice(scored_generation[:5])[0]
      child = crossover(parent_one, parent_two)
      
      if random.random() < 0.3:
        child = mutation(child)
        
      new_generation.append(child)
    generation = new_generation
    
  return(optimal_gene)
