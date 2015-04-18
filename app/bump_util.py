'''
bump-util.py
@author: Suyash Kumar
Common Bumper Pool Functions/Utilities 
'''

from parse import * # Import parse functions

'''
Loads stored playerData in json format, returns dict
of player data
'''
def jsonLoad(path):
	with open(path, 'rb') as fp:
		playerData = json.load(fp)
    	return playerData

'''
Returns a dict of win values and dates comparing playerOne 
to playerTwo (from playerOne's perspective)
'''
def playerCompare(playerOne, playerTwo, playerData):
	p1Data=playerData[playerOne]
	returnData={'win':[],'date':[]} # From Player One's perspective
	for i in xrange(0,len(p1Data['games'])):
		if (p1Data['opponent'][i]==playerTwo):
			returnData['win'].append(p1Data['games'][i])
			returnData['date'].append(p1Data['dates'][i])
	return returnData



if __name__ == '__main__':
    playerData=parse('master.csv')
    print playerCompare('Tyler','Suyash',playerData)

