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
				$scope.playerWins=mySum;
				$scope.playerLosses=data['win'].length-mySum;
				console.log("Now")
				console.log($scope.wins);

			});

	}
}
