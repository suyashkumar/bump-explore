var bumpapp=angular.module('bumpapp',[]);


function mainController($scope, $http){

	$http.get('/api/bumpers').success(
				function(data){ //data is json data response
				$scope.bumpers=data;
				//console.log(data);

			});

	$scope.playerWins="-";
	$scope.playerLosses="-";

	$scope.getBumpers=function(){
		console.log("Called");
		$http.get('/api/bumpers').success(
			function(data){ //data is json data response
			$scope.bumpers=data;
			console.log(data);

		});

	}
	$scope.getComparison=function(){
		$http.get('api/compare/'+$scope.playerOne+'/'+$scope.playerTwo).success(
			function(data){	
				
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

				}
				dataReformat.reverse();		
				$scope.dataReformat=dataReformat; 
				$scope.playerWins=myWins;
				$scope.playerLosses=numGames-myWins;
				// Bin items in datePlot
				var currentWeek=datePlot[0];
				var currentWeekWins=0;
				var currentTotalGames=0;
				var lineGraphData=[{"key":"Wins","values":[]},{"key":"Total Week Games","values":[]}];
				// Iterate though all the games and bin by week.
				for(i=0;i<numGames;i++){
					var currentDate=datePlot[i];
					if (currentDate<=currentWeek+604800000){
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

					
				}			
				


				makePie([{"label":"Wins","value":myWins},{"label":"Losses","value":numGames-myWins}]);
				makeLineGraph(lineGraphData);
			});

	}
	// Make Pie Chart of Data
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
		                  ;

		     chart.xAxis
		        //.tickValues([1078030800000,1122782400000,1167541200000,1251691200000])
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

}

