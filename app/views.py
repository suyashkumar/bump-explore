from flask import *
from app import app
from flask import Response
import json
from parse import *
from bump_util import *
import os
'''
Serve up the index page
'''
@app.route('/')
@app.route('/index')
def index():
	return app.send_static_file('index.html')
@app.route('/index-alt')
def index_alt():
	return app.send_static_file('index-alt.html')
'''
Get List of Bumpers, sorted alphabetically
'''
@app.route('/api/bumpers',methods=['GET'])
def bumpers():
	APP_ROOT = os.path.dirname(os.path.abspath(__file__))
	playerData=parse(os.path.join(APP_ROOT,'static/master.csv'))
	bump=playerData.keys()
	bump.sort()
	#print bump
	return Response(json.dumps(bump),  mimetype='application/json')

@app.route('/api/compare/<p1>/<p2>',methods=['GET'])
def compare(p1,p2):
	APP_ROOT = os.path.dirname(os.path.abspath(__file__))
	
	playerData=parse(os.path.join(APP_ROOT,'static/master.csv'))
	returnDict=playerCompare(p1.strip(),p2.strip(),playerData)
	#print p2
	#print returnDict
	return Response(json.dumps(returnDict),  mimetype='application/json')
