var groupModule = angular.module("GroupModule", ["leaflet-directive"]);

groupModule.controller('GroupCtrl', function($scope, DataService){

	$scope.groups = DataService.mapsetting.groups;
	
	$scope.chooseGroupNum = function($event,value){
        $scope.studentAmount = $scope.groups[value].student;
        $scope.avatarWidth = Math.round(12/$scope.studentAmount);
        $scope.groupNum = value+1;
        DataService.groupNum = value+1;
        DataService.studentAmount = $scope.studentAmount;

		var socket = io.connect('http://localhost:8000');
        socket.emit('choosegroup', { group: $scope.groupnum});
            
    }
});
