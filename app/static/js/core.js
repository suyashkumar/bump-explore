/*
core.js
@author Suyash Kumar (suyashkumar)

Angular front-end application core and controller. Communicates with server
to get and process relevant data, then populates data in front-end
view as required. Acts upon frontend interactions as necessary. 
*/
var bumpapp=angular.module('bumpapp',['ngRoute','ngAnimate']);

/*
 * After the page loads, wait 1000ms and assign
 * page-inited to the value of the main ng-view in
 * index.html. This enables route-change based animations
 * on that ng-view. But animations only happen after intial page load. 
 */
bumpapp.run(function($rootScope, $timeout) {
  $timeout(function() { 
	$rootScope.pageInited="page-inited"
  }, 1000)
});


                    
// ROUTING ===============================================
// set our routing for this application
// each route will pull in a different controller
bumpapp.config(function($routeProvider) {

    $routeProvider

        // pairwise page
        .when('/', {
            templateUrl: 'static/pairwise.html',
            controller: 'pairwiseController'
        })

        // single comparison page
        .when('/single', {
            templateUrl: 'static/single.html',
            controller: 'singleController'
        });

});

// Controllers for the application: 
// Main controller

bumpapp.controller('mainController',function ($scope, $http, $location){
	
	$scope.loc=$location.$$path // Set current loc to current path
	console.log($scope.loc)
	if ($scope.loc=="/single"){
		$scope.sel="single"; 
	}
	else{
		$scope.sel="pair";
	} 
	/*
	 * Update active tab  
	 */
	$scope.select=function(i){
		if (i==1){	
			$scope.sel="pair"	
		}
		else{
			$scope.sel="single"	
		}
	}	
});

/**
 * Controller for the single comparison poriton of the app at /single
 */ 
bumpapp.controller('singleController',function($scope,$http){
	$scope.pageClass='page-about';
	var getBumpers=function(){
		$http.get('/api/bumpers').success(
			function(data){ //data is json data response
			$scope.bumpers=data;
			console.log(data);


		});}
	getBumpers();

	/*
	 * Gets information on currently selected player and populates view
	 */
	$scope.getSingleInfo=function(){
		$http.get('/api/single/'+$scope.singlePlayer).success(
			function(data){
				console.log(data);
				$scope.singlePlayerData=data;
				var numGames=data['pData']['games'].length;
				dataReformat=[];
				for(i=0;i<numGames;i++){
					// Store win and date in "both" array. Easier for front end vis.
					// Each element is an array represents one game. The first element is 
					// date, second is win status. 
					dataReformat[i]=[data['pData']['dates'][i], data['pData']['opponent'][i], data['pData']['games'][i]]; 

				}
				dataReformat.reverse();
				$scope.dataReformat=dataReformat;
			});
	}
	/*
	 * Perfoms a sample comparison of the input player
	 */
	$scope.getSampleComparison=function(player){
		$scope.singlePlayer=player;
		$scope.getSingleInfo();
	}



	

	});
/**
 * Controller for the pairwise comparison view of the app at /
 */

bumpapp.controller('pairwiseController',function ($scope, $http){
	$scope.pageClass='page-home'; 
	/*
	Gets list of bumper pool players from server, passes the JSON
	data to the bumpers variable to populate drop-down selection lists. 
	*/
	var getBumpers=function(){
		$http.get('/api/bumpers').success(
			function(data){ //data is json data response
			$scope.bumpers=data;
			console.log(data);

		});

	}
	getBumpers(); // Update Bumper Lists in drop downs
	// Set win/loss placeholders
	$scope.playerWins="-"; 
	$scope.playerLosses="-";

	/*
	$scope.getComparison() 
	Called when the "Go" button is pressed in the app. Gets the 
	player selections from the application (playerOne and playerTwo), 
	and passes them to server to retrieve a comparison. Server returns 
	win/loss record of all games played and dates of all games played. 
	Data then manipulated and plotted. 
	*/
	$scope.getComparison=function(){
		$http.get('api/compare/'+$scope.playerOne+'/'+$scope.playerTwo).success(
			function(data){
				console.log('Data');
				console.log(data);	
				var dataReformat=[];
				var myWins=0;
				var datePlot=[];
				var numGames=data['win'].length;
				for(i=0;i<numGames;i++){
					// Store win and date in "both" array. Easier for front end vis.
					// Each element is an array represents one game. The first element is 
					// date, second is win status. 
					dataReformat[i]=[data['date'][i], data['win'][i]];
					// Keep track of wins
					myWins+=data['win'][i];
					datePlot[i]=Date.parse(data['date'][i]);
					console.log(data['date'][i]);

				}
				console.log('dateplot:');
				console.log(datePlot.length);
				dataReformat.reverse();		
				$scope.dataReformat=dataReformat; 
				$scope.playerWins=myWins;
				$scope.playerLosses=numGames-myWins;
				
				var $pie = $('#pieTitle');
				$pie.text('Games Won/Lost');
				
				var $line = $('#lineTitle');
				$line.text('Games Played and Games Won');
				
				var $elo =$('#eloTitle');
				$elo.text('Elo Over Time');
				makePie([{"label":"Wins","value":myWins/numGames},{"label":"Losses","value":(numGames-myWins)/numGames}]); // Make Pie Chart
				lineGraphData=processLineGraph(data,datePlot,numGames); // Generate line graph data (games played, games won)
			
				makeLineGraph(lineGraphData); // Make line graph
				var eloGraphData=[{"key":$scope.playerOne,"values":data['p1EloHistory']},{"key":$scope.playerTwo,"values":data['p2EloHistory']}]
				makeEloLineGraph(eloGraphData);

				});
							

	}
	/*
	Processes win/loss record and list of dates for plotting. Currently bins by week. 	
	*/
	var processLineGraph=function(data,datePlot,numGames){

		// Bin items in datePlot
		var currentWeek=datePlot[0];
		var currentWeekWins=0;
		var currentTotalGames=0;
		var lineGraphData=[{"key":"Wins","values":[]},{"key":"Total Week Games","values":[]}];
		// Iterate though all the games and bin by week. Store data in plotting form
		// in lineGraphData defined above.
		for(i=0;i<numGames;i++){
			var currentDate=datePlot[i];
			if (currentDate<=currentWeek+604800000){ // There are 604800000ms in a week
				// Add this game's win/loss to currentWeekWins
				currentWeekWins+=data['win'][i];
				currentTotalGames+=1;
			}
			else{
				lineGraphData[0]['values'].push([currentWeek,currentWeekWins]);
				lineGraphData[1]['values'].push([currentWeek,currentTotalGames]);
				currentWeek=currentWeek+604800000; 
				currentWeekWins=data['win'][i];
				currentTotalGames=1;
			}
			// check if last iteration and add remaining data if not added yet
			if(i==datePlot.length-1 && currentDate<=currentWeek+604800000){
				lineGraphData[0]['values'].push([currentWeek,currentWeekWins]);
				lineGraphData[1]['values'].push([currentWeek,currentTotalGames]);
			}
		var currD=new Date(0);
		currD.setUTCSeconds(currentDate);
		console.log('current date ', currD);
		currD.setUTCSeconds(currentWeek);
		console.log('current week ',currD);
				
		}
		console.log(lineGraphData);
		return lineGraphData; 


	}
	var makeEloLineGraph=function(data){
		nv.addGraph(function() {
		      var chart = nv.models.lineChart()
                .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                .transitionDuration(350)  //how fast do you want the lines to transition?
                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                .showYAxis(true)        //Show the y-axis
                .showXAxis(true)        //Show the x-axis
                .x(function(d){return d[0]})
                .y(function(d) {return d[1]})
		.width(780)
		.height(300)
		                  ;

		     chart.xAxis 
		        .tickFormat(function(d) {	
		            return d3.time.format('%x')(new Date(d))
		          }).axisLabel('Day');

			chart.yAxis     //Chart y-axis settings
			.axisLabel('Elo')
			.tickFormat(d3.format('.02f'));

		    d3.select('#elo svg')
		        .datum(data)
		        .call(chart);
		d3.select('#elo svg').datum(data).transition().duration(500).call(chart).style({ 'width': 780, 'height': 300 });

		    //TODO: Figure out a good way to do this automatically
		     nv.utils.windowResize(function() { chart.update() });

		    return chart;
		    
  		});


	}


	// Makes an nvd3 pie chart of input win/loss data. 	
	var makePie=function(data){
		nv.addGraph(function() {
		  var chart = nv.models.pieChart()
		      .x(function(d) { return d.label })
		      .y(function(d) { return d.value })
		      .showLabels(true);
		    d3.select("#chart svg")
		        .datum(data)
		      .transition().duration(1200)
		        .call(chart);	

		  return chart;
		});
	}
	/*
	Makes an nvd3 line graph of input data. 
	*/
	var makeLineGraph=function(data){
		nv.addGraph(function() {
		      var chart = nv.models.lineChart()
                .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                .transitionDuration(350)  //how fast do you want the lines to transition?
                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                .showYAxis(true)        //Show the y-axis
                .showXAxis(true)        //Show the x-axis
                .x(function(d){return d[0]})
                .y(function(d) {return d[1]})
				//.width(400)
				//.height(300)
		
	
		                  ;
				//		  d3.select('#elo svg').datum(data).transition().duration(500).call(chart).style({ 'width': 400, 'height': 300 });


		     chart.xAxis 
		        .tickFormat(function(d) {
		            return d3.time.format('%x')(new Date(d))
		          }).axisLabel('Week');

			chart.yAxis     //Chart y-axis settings
			.axisLabel('Games')
			.tickFormat(d3.format('.02f'));

		    d3.select('#lineGraph svg')
		        .datum(data)
		        .call(chart);

		    //TODO: Figure out a good way to do this automatically
		     nv.utils.windowResize(function() { chart.update() });


		    return chart;
		    
  		});

	}
	$scope.sampleComparison=function(p1,p2) {
		$scope.playerOne=p1;
		$scope.playerTwo=p2;
		$scope.getComparison();
		




	}

});

