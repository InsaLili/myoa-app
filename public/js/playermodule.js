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

playerModule.controller('PlayerCtrl', function($scope, DataService,$timeout){
	var socket = io.connect('http://localhost:8000');
	$scope.player = DataService.studentNum;
	$scope.groupNum = DataService.groupNum;
	$scope.notes = DataService.notes.rows[DataService.groupNum-1].doc.notes;
	$scope.markers = DataService.mapsetting.markers;
	$scope.locationInfo = "hello lili";

	$scope.serviceInit = function(){
        socket.on('choosegroup', function(data){
            console.log(data);
            groupNum = data.group;
        });
        socket.on('checklocation', function (data) {
        	$scope.checklocation(data);
        });
        socket.on('chooselocation', function (data) {
            $scope.chosenNumber = data.location;
        });
    };

    $scope.checklocation = function(data){
		if(data.player == $scope.player){
            $scope.currentLocation = data.marker;
            $scope.locationInfo = $scope.markers[$scope.currentLocation-1].data;
        	console.log($scope.locationInfo);
        	$scope.$apply();
    	}
    }
    $scope.addLocalNote = function($event){
    	if(!$scope.currentLocation){
			$('#chooseLocationDlg').dialog('open');
			return;
    	}
    	if(!$scope.currentNote){
            $('#writeNoteDlg').dialog('open');
            return;
        }
    	var currentNote = {
    		player:$scope.player,
    		location: $scope.currentLocation,
    		content: $scope.currentNote
    	}
    	$scope.notes.push(currentNote);
    	$scope.currentNote=undefined;
    	$scope.updateDB();
    	socket.emit('addlocalnote', {notes:$scope.notes});
    }
    $scope.deleteLocalNote = function($event){
    	// return the text of <p>
    	var content = $event.target.parentElement.firstElementChild.textContent;
        // keep all the notes expect the one has value of "content"
        $scope.notes = $.grep($scope.notes, function(value) {
		 	return value.content != content;
		});
		$scope.updateDB();
    	socket.emit('deletelocalnote', {notes:$scope.notes});
    }
    $scope.updateDB = function(){
    	var db = new PouchDB('http://localhost:5984/framework');
    	db.get('note_'+$scope.groupNum).then(function(doc){
    		return db.put({
    			notes:$scope.notes
    		}, 'note_'+$scope.groupNum, doc._rev);
    	});
    }
	$timeout(function(){
        $( '#chooseLocationDlg' ).dialog({
            autoOpen: false,
            height:200,
            modal: true,
            buttons:{
                "OK": function(){
                    $(this).dialog("close");
                }
            }
        });
        $( '#writeNoteDlg' ).dialog({
            autoOpen: false,
            height:200,
            modal: true,
            buttons:{
                "OK": function(){
                    $(this).dialog("close");
                }
            }
        });
    });
    $scope.serviceInit();

});
