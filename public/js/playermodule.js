var playerModule = angular.module("PlayerModule", []);

playerModule.controller('RoleCtrl', function($scope, DataService){

	$scope.groupNum = 1;
	DataService.groupNum=1;
	$scope.studentAmount = parseInt(DataService.mapsetting.groups[$scope.groupNum-1].student);
	
	$scope.range = function(n) {
        return new Array(n);   
    }
	
	$scope.chooseStudentNum = function($event,value){
        DataService.studentNum = value+1;
    }
});

playerModule.controller('PlayerCtrl', function($scope, DataService){
	$scope.player = DataService.studentNum;
	$scope.notes = DataService.notes.rows[DataService.groupNum-1].doc.notes;
	$scope.markers = DataService.mapsetting.markers;
	$scope.locationInfo = "hello lili";

	$scope.serviceInit = function(){
    	var socket = io.connect('http://localhost:8000');
        socket.on('choosegroup', function(data){
            console.log(data);
            groupNum = data.group;
        });
        socket.on('checklocation', function (data) {
        	if(data.player == $scope.player){
	            $scope.currentLocation = data.marker;
	            $scope.locationInfo = $scope.markers[$scope.currentLocation-1].data;
	        	console.log($scope.locationInfo);
	        	$scope.$apply();
        	}
        });
        socket.on('chooselocation', function (data) {
            $scope.chosenNumber = data.location;
        });
    };

    $scope.serviceInit();

});
