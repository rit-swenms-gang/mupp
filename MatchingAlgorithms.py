import random

rounds = 3
maxGroupSize = 5
numQuestions = 4
questionWeights = [5, 2, 1, 1, 1]

totalWeights = 0
for weight in questionWeights:
    totalWeights+=weight



class Leader():  #Leader class
  def __init__(self, name, email, preferenceList):
    self.name = name
    self.email = email
    self.preferenceList = preferenceList
    
    self.slotsOpen = maxGroupSize * rounds
    
    self.schedule = []
    for i in range(rounds):
        self.schedule.append([])
        
        
    self.matches = []
    for j in range(totalWeights):
        self.matches.append([])
        
  def matchParticipant(self, participant, weights):
    matchScore = 0  #the overall score of how many questions matched up
    for i in range(len(self.preferenceList)):
      if self.preferenceList[i] == participant.preferenceList[i]:
        matchScore += 1*weights[i]
    return (matchScore)

  def clearSchedule(self):
    self.schedule = []
    for i in range(i,rounds):
        self.schedule.append([])
    self.slotsOpen = maxGroupSize * rounds

  def scheduleParticipant(self, roundNumber, participant):
    self.schedule[roundNumber].append(participant)
    self.slotsOpen -= 1
    
    
class Participant():  #Participant class

  def __init__(self, name, email, preferenceList):
    self.name = name
    self.email = email
    self.preferenceList = preferenceList

    self.schedule = [None] * rounds
    self.roundsScheduled = 0
    
  def clearSchedule(self):
      self.schedule = [None] * rounds
      self.roundsScheduled = 0

  def scheduleRound(self, roundNumber, leader):
      self.schedule[roundNumber] = leader
      self.roundsScheduled += 1

def generateMatches(leaders, participants, weights):
    for leader in leaders:
        for participant in participants:
            matchScore = leader.matchParticipant(participant, weights)
            leader.matches[matchScore].append(participant)
            
def tierListOptimizedGenerator(leaders, participants):
    generationComplete = False
    totalSlotsAvailable = len(participants) * rounds
    roundMatchingOrder = []
    for i in range(rounds):
      roundMatchingOrder.append(i)
    
    while(not generationComplete):
      totalSlotsScheduled = 0
      k = 0
      for participant in participants:
        participant.clearSchedule
        
      for leader in leaders:
        leader.clearSchedule
          
      while((k<=totalSlotsAvailable) and (not generationComplete)):
        k+=1
        for i in range(totalWeights-1, -1, -1):
          random.shuffle(leaders)
          for leader in leaders:
            random.shuffle(leader.matches[i])
            for participant in leader.matches[i]:
              if((participant.roundsScheduled < rounds) and (leader not in participant.schedule) and leader.slotsOpen > 0):
                random.shuffle(roundMatchingOrder)
                for round in roundMatchingOrder:
                  if((len(leader.schedule[round]) < maxGroupSize) and (participant.schedule[round] == None) and (leader not in participant.schedule)):
                    leader.scheduleParticipant(round, participant)
                    participant.scheduleRound(round, leader)
                    totalSlotsScheduled +=1
      if(totalSlotsScheduled == totalSlotsAvailable):
        generationComplete = True

def pSchNameConversion(participantSchedule):
  nameSchedule = []
  for leader in participantSchedule:
    nameSchedule.append(leader.name)
  return(nameSchedule)
    
def lSchNameConversion(leaderSchedule):
  nameSchedule = leaderSchedule
  for i in range(len(nameSchedule)):
    for j in range(len(nameSchedule[i])):
      nameSchedule[i][j] = nameSchedule[i][j].name
  return(nameSchedule)

def outputSchedule(leaders,participants):
  scheduleDict = {}
  for leader in leaders:
    scheduleDict[leader.name] = lSchNameConversion(leader.schedule) 
  for participant in participants:
    scheduleDict[participant.name] = pSchNameConversion(participant.schedule) 
  return(scheduleDict)
            
def geneEvaluator(gene,weights):
  totalMatchScore = 0
  for leader, schedule in gene.items():
    for participant in schedule:
      totalMatchScore += leader.matchParticipant(participant,weights)
  return(totalMatchScore)
    
   
          
def generateParent(leaders,participants):
  tierListOptimizedGenerator(leaders,participants)
  parent = {}
  i = 0
  for leader in leaders:
    i+=1
    parent[leader] = leader.schedule
  return(parent)

def geneToSchedule(gene,leaders,participants):
  for participant in participants:
    participant.clearSchedule
    
  for leader in leaders:
    leader.clearSchedule
    
  for leader, schedule in gene.items():
    for i in range(len(schedule)):
      leader.scheduleParticipant(i,schedule[i])
      participant.scheduleRound(i,leader)
      
          
def geneticOptimizer(leaders, participants, weights):
  maxScore = 0
  optimalGene = []
  secondaryParent = []
  generationSize = 10
  iterations = 10
  generateMatches(leaders,participants,weights)
  generation = []
  
  for i in range(generationSize):
    print(type(generateParent(leaders,participants)))
    generation.append(generateParent(leaders,participants))
    print("whyyyy")
    
  for i in range(iterations):
    for gene in generation:
      score = geneEvaluator(gene,weights)
      if score > maxScore:
        maxScore = score
        optimalGene = gene
      #...
      
  geneToSchedule(optimalGene,leaders,participants)
      
    
