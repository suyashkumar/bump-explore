var bumpapp=angular.module('bumpapp',[]);

function mainController($scope, $http){

$http.get('/api/bumpers').success(
			function(data){ //data is json data response
			$scope.bumpers=data;
			//console.log(data);

		});

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
				
				for(i=0;i<data['win'].length;i++){
					//$scope.both.push([data['win'][i],data['date'][i]]);
					$scope.both[i]=[data['date'][i], data['win'][i]];
				}
				console.log("Now")
				console.log($scope.wins);

			});

	}
}
