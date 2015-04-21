var bumpapp=angular.module('bumpapp',[]);


function mainController($scope, $http){

	$http.get('/api/bumpers').success(
				function(data){ //data is json data response
				$scope.bumpers=data;
				//console.log(data);

			});

	$scope.playerWins="-";
	$scope.playerLosses="-";
	$scope.options = {
            chart: {
                type: 'discreteBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 55
                },
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showValues: true,
                valueFormat: function(d){
                    return d3.format(',.4f')(d);
                },
                transitionDuration: 500,
                xAxis: {
                    axisLabel: 'X Axis'
                },
                yAxis: {
                    axisLabel: 'Y Axis',
                    axisLabelDistance: 30
                }
            }
        };

        $scope.data = [
            {
                key: "Cumulative Return",
                values: [
                    {
                        "label" : "A" ,
                        "value" : -29.765957771107
                    } ,
                    {
                        "label" : "B" ,
                        "value" : 0
                    } ,
                    {
                        "label" : "C" ,
                        "value" : 32.807804682612
                    } ,
                    {
                        "label" : "D" ,
                        "value" : 196.45946739256
                    } ,
                    {
                        "label" : "E" ,
                        "value" : 0.19434030906893
                    } ,
                    {
                        "label" : "F" ,
                        "value" : -98.079782601442
                    } ,
                    {
                        "label" : "G" ,
                        "value" : -13.925743130903
                    } ,
                    {
                        "label" : "H" ,
                        "value" : -5.1387322875705
                    }
                ]
            }
        ]

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
				console.log(data);
				$scope.dates=data['date'];
				$scope.wins=data['win'];
				$scope.both=[];
				var mySum=0;
				for(i=0;i<data['win'].length;i++){
					// Store win and date date in "both" array. Easier for front end vis.
					// Each element is an array representing one game. The first element is 
					// date, second is win status. 
					$scope.both[i]=[data['date'][i], data['win'][i]];
					// Keep track of wins
					mySum+=data['win'][i];

				}
				var totalGames=data['win'].length;
				$scope.playerWins=mySum;
				$scope.playerLosses=data['win'].length-mySum;
				console.log("Now")
				console.log($scope.wins);

				makePie([{"label":"Wins","value":mySum},{"label":"Losses","value":totalGames-mySum}]);
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

}

