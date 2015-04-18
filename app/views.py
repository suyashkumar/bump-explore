from flask import *
from app import app
from flask import Response
import json
from parse import *
from bump_util import *
import os
'''
Index routes
'''
@app.route('/')
@app.route('/index')
def index():
	return render_template('index.html')
'''
Get List of Bumpers, sorted alphabetically
'''
@app.route('/api/bumpers',methods=['GET'])
def bumpers():
	APP_ROOT = os.path.dirname(os.path.abspath(__file__))
	playerData=parse(os.path.join(APP_ROOT,'master.csv'))
	bump=playerData.keys()
	bump.sort()
	print bump
	return Response(json.dumps(bump),  mimetype='application/json')

@app.route('/api/compare/<p1>/<p2>',methods=['GET'])
def compare(p1,p2):
	APP_ROOT = os.path.dirname(os.path.abspath(__file__))
	
	playerData=parse(os.path.join(APP_ROOT,'master.csv'))
	returnDict=playerCompare(p1.title(),p2.title(),playerData)
	print returnDict
	return Response(json.dumps(returnDict),  mimetype='application/json')