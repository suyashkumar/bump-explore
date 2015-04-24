# parse.py
# @author: Suyash Kumar
# Parses Bumper Pool data from ledger into a nice json data structure

from dateutil.parser import parse as dateparse
import json
def parse(file1):
	'''
	Player data is keyed by player name as used in Tyler's master ledger. 
	The value in the playerData dict is another dict with the following 
	paramters (keys): 'dates'->(array of string dates),'games'->(array
	of 1 or 0 signifying win or loss for each game played), 'opponent'
	'numWins'-> number of wins
	'''
	playerData={}
	mFile=open(file1,'r')
	# Skip first two lines in file 
	mFile.readline();
	mFile.readline();
	# Loop through each line in file
	currentDate="replace" # Will be replaced with date in the first iteration
	for line in mFile:
		currentData=line.split(','); # Split current line at , delimiter
		# Update the current date if it needs to be changed
		if (len(currentData[2])>1 and currentData[2]!=currentDate):
			currentDate=currentData[2] # Update current date
		name=currentData[0].strip()
		#print name
		#print len(name.split(" "))
		if (len(name.split(" "))>1):
			# Repeat games!
			repeat=int(name.split(" ")[1])
			for i in xrange(0,repeat):
				addData(currentData[0].split(" ")[0],currentDate,1, currentData[1], playerData)
				addData(currentData[1],currentDate,0, currentData[0].split(" ")[0], playerData)
		else:
			addData(currentData[0].split(" ")[0],currentDate,1, currentData[1], playerData)
			addData(currentData[1],currentDate,0, currentData[0].split(" ")[0], playerData)
	mFile.close()
	#print playerData
	return playerData
'''
addData
Adds a game to a player's record in a playerData dict structure 
'''			
def addData(name, date, win, opponent, playerData):
# Find Winning Player's entry in playerData
		if (playerData.get(name) !=None):
			# Add information to player's entry
			playerData.get(name).get('games').append(win) #Update games
			playerData.get(name).get('dates').append(date)
			playerData.get(name).get('opponent').append(opponent)
		else:
			# Create new entry in playerData for this player
			playerData[name]={'games':[],'dates':[],'opponent':[]}
			playerData.get(name).get('games').append(win) #Update games
			playerData.get(name).get('dates').append(date)	
			playerData.get(name).get('opponent').append(opponent)
'''
Saves JSON 
'''
def saveJSON(playerData):
	with open('data.json','w') as fp:
		json.dump(playerData,fp)


if __name__ == '__main__':
    playerData=parse('static/master.csv')
    print playerData['Jeremy']['opponent']
    saveJSON(playerData)


