import random
import copy

rounds = 3
maxGroupSize = 5
numQuestions = 5
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
    for i in range(rounds):
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
        participant.clearSchedule()
      
      for leader in leaders:
        leader.clearSchedule()
          
      while((k < totalSlotsAvailable) and (not generationComplete)):
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
    
    return(geneticOptimizer)

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
  TMSWeight = 1
  minGSWeight = 0
  maxGSWeight = 0
  GSAvgWeight = 0
  minMSWeight = 0
  
  return(TMSWeight*TMSCalc(gene,weights))

def TMSCalc(gene,weights):
  totalMatchScore = 0
  for leader, schedule in gene.items():
    for round in schedule:
      for participant in round:
        totalMatchScore += leader.matchParticipant(participant,weights)
  return(totalMatchScore)

def minGroupSizeCalc(gene):
    minSize = float('inf')
    for leader in gene:
        for roundGroup in gene[leader]:
            groupSize = len(roundGroup)
            if groupSize < minSize:
                minSize = groupSize
    return minSize

def maxGroupSizeCalc(gene):
    maxSize = 0
    for leader in gene:
        for roundGroup in gene[leader]:
            groupSize = len(roundGroup)
            if groupSize > maxSize:
                maxSize = groupSize
    return maxSize

def groupSizeAvgCalc(gene):
    total = 0
    count = 0
    for leader in gene:
        for roundGroup in gene[leader]:
            total += len(roundGroup)
            count += 1
    if count == 0:
        return 0
    return total / count

def minMatchScoreCalc(gene):
    minScore = float('inf')
    for leader in gene:
        for roundGroup in gene[leader]:
            for participant in roundGroup:
                score = leader.matchParticipant(participant, questionWeights)
                if score < minScore:
                    minScore = score
    return minScore
  
          
def generateParent(leaders,participants):
  parent = {}
  i = 0
  for leader in leaders:
    i+=1
    parent[leader] = leader.schedule
  return(parent)

def geneToSchedule(gene,leaders,participants):
  for participant in participants:
    participant.clearSchedule()
    
  for leader in leaders:
    leader.clearSchedule()
    
  for leader, schedule in gene.items():
    for i in range(len(schedule)):
      for participant in schedule[i]:
        leader.scheduleParticipant(i,schedule[i])
        participant.scheduleRound(i,leader)
        
def checkValidGene(gene):
  found = []
  for schedule in gene.values():
    for player in schedule:
      if player in found:
        return(False)
      else:
        found.append(player)
  
  return(True)
    
    
        

def mutation(gene):
  mutatedGene = copy.deepcopy(gene)
  leaders = list(mutatedGene.keys())
  
  if not leaders: 
    return (mutatedGene)
  
  leader = random.choice(leaders)
  roundIndex = random.randint(0, rounds - 1)
  participants = mutatedGene[leader][roundIndex]
  
  if len(participants) >= 2:
    i, j = random.sample(range(len(participants)), 2)
    participants[i], participants[j] = participants[j], participants[i]
  
  if(checkValidGene):  
    return (mutatedGene)
  else:
    return(gene)


def crossover(geneOne, geneTwo):
  child = {}
  
  for leader in geneOne:
    childSchedule = []
    for r in range(rounds):
      if random.random() < 0.5:
        childSchedule.append(copy.deepcopy(geneOne[leader][r]))
      else:
        childSchedule.append(copy.deepcopy(geneTwo[leader][r]))
        
    child[leader] = childSchedule
  
  if checkValidGene(child):
    return (child)
  else:
    if random.random() < 0.5:
      return(geneOne)
    else:
      return(geneTwo)


      
def geneticOptimizer(leaders, participants, weights):
  maxScore = 0
  optimalGene = None
  generationSize = 10
  iterations = 10
  generateMatches(leaders, participants, weights)
  generation = []
  for i in range(generationSize):
    generation.append(generateParent(leaders, participants))


  for j in range(iterations):
    scoredGeneration = []
    for gene in generation:
      scoredGeneration.append((gene, geneEvaluator(gene, weights)))

    scoredGeneration.sort(key=lambda x: x[1], reverse=True)
    
    if scoredGeneration[0][1] > maxScore:
      maxScore = scoredGeneration[0][1]
      optimalGene = scoredGeneration[0][0]
    newGeneration = [scoredGeneration[0][0], scoredGeneration[1][0]]
    
    while len(newGeneration) < generationSize:
      parentOne = random.choice(scoredGeneration[:5])[0]
      parentTwo = random.choice(scoredGeneration[:5])[0]
      child = crossover(parentOne, parentTwo)
      
      if random.random() < 0.3:
        child = mutation(child)
        
      newGeneration.append(child)
    generation = newGeneration
    
    return(optimalGene)

    
  