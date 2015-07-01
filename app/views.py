from flask import *
from app import app
from flask import Response
import json
from bump_util.parsing import parse 
from bump_util.elo import elo_util 
from bump_util import bump_util 
import os
'''
Serve up the index page
'''
@app.route('/')
@app.route('/index')
def index():
	return app.send_static_file('index-views.html')

# Set max-age for cached files in response headers. 
@app.after_request
def add_header(response):
    response.cache_control.max_age = 300 # 300 seconds max-age of page cache
    return response

@app.route('/index-alt')
def index_alt():
	return app.send_static_file('index.html')
'''
Get List of Bumpers, sorted alphabetically
'''
@app.route('/api/bumpers',methods=['GET'])
def bumpers():
	APP_ROOT = os.path.dirname(os.path.abspath(__file__))
	playerData=parse.parse(os.path.join(APP_ROOT,'static/master.csv'))
	bump=playerData.keys()
	bump.sort()
	#print bump
	return Response(json.dumps(bump),  mimetype='application/json')

@app.route('/api/compare/<p1>/<p2>',methods=['GET'])
def compare(p1,p2):
	APP_ROOT = os.path.dirname(os.path.abspath(__file__))
	
	playerData=parse.parse(os.path.join(APP_ROOT,'static/master.csv'))
	returnDict=bump_util.playerCompare(p1.strip(),p2.strip(),playerData)
	print returnDict
	# Add Elo data to return dict
	try:
		playerElos=elo_util.calculateElo(os.path.join(APP_ROOT,'static/master.csv'))	
		returnDict['p1EloHistory']=elo_util.getFullEloHistory(playerElos,p1.strip())
		returnDict['p2EloHistory']=elo_util.getFullEloHistory(playerElos,p2.strip())
	except KeyError:
		print "Player likely not ranked"
		returnDict['p1EloHistory']=[]
		returnDict['p2EloHistory']=[]

			
	return Response(json.dumps(returnDict),  mimetype='application/json')



	
