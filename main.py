import pandas as pd

import random


#Number of rounds of party matching party, i.e. number of games each DM is going to run
games = 3

#Number of preference based questions you want the computer to match based upon. This does NOT include things like name and email
numQuestions = 6

QuestionOneText = "How would you like to participate?"
QuestionOneWeight = 1
QuestionOneType = "DMorPlayer"

#question1 = classes.Question(QuestionOneText, QuestionOneWeight, QuestionOneType)

qName = "Name"
qDMorPlayer = "How would you like to participate?"

q1 = "When you play DND what are you more focused on?"
q1Weight = 3

q2 = "What is your experience level?"
q1Weight = 1

q3 = "What experience level are you looking to play with?"
q3Weight = 1

q4 = "What is your favorite style of campaign? (choose 3)"
q4Weight = 2

q5 = "How do you feel about Rules As Written "
q6Weight = 1

q6 = "What's your play style?"
q7Weight = 2

q8 = " "
q8Weight = 1

q9 = " "
q9Weight = 1

q10 = " "
q10Weight = 1

questionQueue = [q1, q2, q3, q4, q5, q6]
questionQueue = questionQueue[:numQuestions]

class Question():  #Question object class

  def __init__(self, questionText, weight, type):
    self.questionText = questionText
    self.weight = weight
    self.type = type


class DungeonMaster():  #dungeon master class

  def __init__(self, name, focus, xp, xpPW, campaignStyles, RAWness,
               playStyle, DMClassification):
    self.name = name
    xp = xp.split()
    self.xp = xp[0]
    self.xpPW = xpPW
    self.campaignStyles = campaignStyles.split(";")
    if (DMClassification == "The dice fall how they fall what happens happens"
        ):
      DMClassification = "bad rolls"
    elif (DMClassification == "I will kill my PCs for plot"):
      DMClassification = "plot"
    elif (DMClassification == "I will protect my PCs for plot"):
      DMClassification = "makes sense"
    elif (DMClassification ==
          "My PCs honestly won't die (but I'll still scare them about it"):
      DMClassification = "safe"

    self.preferenceMatchList = [
        focus, RAWness, playStyle, DMClassification
    ]

    self.schedule = [[], [], []]

    self.playerQueue = [[], [], [], [], [], [], [], []]

    self.slotsOpen = 15

  def matchPlayer(self, player):
    matchScore = 0  #the overall score of how many questions matched up
    campaignStyleMod = 0  #initializing the
    for i in range(len(self.preferenceMatchList)):
      if self.preferenceMatchList[i] == player.preferenceMatchList[i]:
        matchScore += 1
    if player.xp in self.xpPW:
      matchScore += 1
    for item in self.campaignStyles:
      if item in player.campaignStyles:
        campaignStyleMod = 1
    matchScore += campaignStyleMod

    return (matchScore)

  def clearSchedule(self):
    self.schedule = [[], [], []]
    self.slotsOpen = 15

  def schedulePlayer(self, gameNumber, playerID):
    self.schedule[gameNumber].append(playerID)
    self.slotsOpen -= 1


class Player():  #player class

  def __init__(self, name, playerID, focus, xp, xpPW, campaignStyle,
               RAWness, playStyle, playerClassification, games):
    self.name = name
    self.playerID = playerID
    xp = xp.split(
    )  #The xp data includes the definition of each experience level, this line gets rid of the definition so we can match it with the experience level played with question
    self.xp = xp[0]
    self.xpPW = xpPW
    self.campaignStyles = campaignStyle.split(
        ";"
    )  #this splits the campaign styles that the player selected into an array holding all of them
    #these if else statements are converting the matching answers of the DM version and player version of this question to the same keyphrase to make it easier for the computer to match them
    if (playerClassification ==
        "It's all about a good plot my PC is subject to it"):
      playerClassification = "plot"
    elif (
        playerClassification ==
        "I put a lot of effort into my PC but if their death makes sense thats okay"
    ):
      playerClassification = "makes sense"
    elif (playerClassification ==
          "I like my PC but bad rolls happen and if they die they die"):
      playerClassification = "bad rolls"


#a list of the preferences that have the same format of answer to the DM questions and can easily be matched
    self.preferenceMatchList = [
        focus, RAWness, playStyle, playerClassification
    ]

    self.schedule = [
        None
    ] * games  #creates an empty schedule with as many slots as there are games
    self.gamesScheduled = 0  #variable to keep track of how many games we have scheduled

  def clearSchedule(self):
    self.schedule = [None] * games
    self.gamesScheduled = 0

  def scheduleGame(self, gameNumber, DM):
    self.schedule[gameNumber] = DM
    self.gamesScheduled += 1


def avgTable(DMs, players):  #function that finds the ratio of players to DMs
  avg = len(players) / len(DMs)
  return (avg)


def maxTable(
    DMs, players
):  #functions that finds the max number of players that each table will have
  return (int(avgTable(DMs, players) + 1))


DMs = []
players = [
]  #the arrays that will hold each instance of both the player and DM clas

fullCSV = pd.read_csv("PMP.csv")  #read in the CSV
playerID = 0
for row, column in fullCSV.iterrows(
):  #for loop that goes through the CSV and initializes each player and DM into seperate lists
  if (column["How would you like to participate?"] == "As a DM"):
    DMs.append(
        DungeonMaster(
            column["Name"],
            column["When you Play DND what are you more focused on?"],
            column["What is your experience level?"],
            column["What experience level are you looking to play with?"],
            column["What is your favorite style of campaign? (choose 3)"],
            column["How do you feel about Rules As Written?"],
            column["What's your play style?"],
            column["How would you classify yourself as a DM? (if applicable)"])
    )
  else:
    playerID += 1
    if playerID <= 11:
      playerID += 100
      players.append(
          Player(
              column["Name"], playerID,
              column["When you Play DND what are you more focused on?"],
              column["What is your experience level?"],
              column["What experience level are you looking to play with?"],
              column["What is your favorite style of campaign? (choose 3)"],
              column["How do you feel about Rules As Written?"],
              column["What's your play style?"], column[
                  "How would you classify yourself as a Player? (if applicable)"],
              games))
      playerID -= 100
    else:
      players.append(
          Player(
              column["Name"], playerID,
              column["When you Play DND what are you more focused on?"],
              column["What is your experience level?"],
              column["What experience level are you looking to play with?"],
              column["What is your favorite style of campaign? (choose 3)"],
              column["How do you feel about Rules As Written?"],
              column["What's your play style?"], column[
                  "How would you classify yourself as a Player? (if applicable)"],
              games))

maxPlayers = maxTable(
    DMs,
    players)  #calculates the min and max numbers of players based on the CSV
minPlayers = maxPlayers - 1

for DM in DMs:
  for player in players:  #these for loops go through each DM and compares each DM's answers to each player's answers and comes up with a score based on how many of their answers matched

    matchScore = DM.matchPlayer(player)

    DM.playerQueue[matchScore].append(
        player
    )  #this creates a 2d array where each column represents all of the players that had the match score of the index. I call this a First In Best Out FIBO data structure

fullScheduleComplete = False
gamesToBeScheduled = len(players) * games  #initialize loop variables

while (
    not fullScheduleComplete
):  #this will repeat the scheduling process until a valid schedule is made
  totalGamesScheduled = 0
  k = 0
  for DM in DMs:  #clear the schedule for both the player and the DM
    DM.clearSchedule()
  for player in players:
    player.clearSchedule()

  while (
      k <= gamesToBeScheduled and not fullScheduleComplete
  ):  #loops until a valid schedule is generated, or it is determined that no valid schedule can be generated
    k += 1  #the k value is the amount of times it has looped through the program, if it ever exceeds the games to be scheduled, then a valid schedule was not generated therefore it exits the loop to reset the schedules
    for i in range(
        7, -1, -1):  #loops through the columns of the FIBO from best to worst
      random.shuffle(DMs)
      for DM in DMs:  #shuffles the order of the DMs and loops through them
        random.shuffle(DM.playerQueue[i])
        for player in DM.playerQueue[
            i]:  #shuffles the order of each player in the column of the FIBO then loops through them
          if (
              (player.gamesScheduled < games) and (DM.slotsOpen > games)
              and (DM.name not in player.schedule)
          ):  #checks to see if the player has slots open in their schedule, and to see if the DM has reached the minimum amount of players for each of their games
            for i in range(games):  #loops through the number of games
              if (
                  (len(DM.schedule[i]) < minPlayers)
                  and (player.schedule[i] == None)
                  and (DM.name not in player.schedule)
              ):  #checks to see if both the DM and the player have a slot open at the specific game specified
                DM.schedulePlayer(i, player.name)
                player.scheduleGame(
                    i, DM.name
                )  #if both DM and player have slots open, add the DM to the player's schedule and the player to the DM's schedule
                totalGamesScheduled += 1  #also incriment the total games scheduled

    for i in range(7, -1, -1):
      random.shuffle(DMs)
      for DM in DMs:
        random.shuffle(DM.playerQueue[i])
        for player in DM.playerQueue[i]:
          if ((player.gamesScheduled < games) and (DM.slotsOpen > 0)
              and (DM.name not in player.schedule)):
            for i in range(games):
              if ((len(DM.schedule[i]) < maxPlayers)
                  and (player.schedule[i] == None)
                  and (DM.name not in player.schedule)):
                DM.schedulePlayer(i, player.name)
                player.scheduleGame(i, DM.name)
                totalGamesScheduled += 1

    if (totalGamesScheduled == gamesToBeScheduled):
      fullScheduleComplete = True


"""
for DM in DMs:
  print(DM.name)
  for item in DM.schedule:
    print(item)

print("--------------------------------------------")
for player in players:
  print(player.name)
  print(player.schedule)
  
  """