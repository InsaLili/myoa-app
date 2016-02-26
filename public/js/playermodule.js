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

    $scope.range = function(n) {
        return new Array(n);   
    }

    getData = function(){
        $scope.player = DataService.studentNum;
        $scope.groupNum = DataService.groupNum;
        $scope.notes = DataService.notes.rows[DataService.groupNum-1].doc.notes;
        $scope.votes = DataService.votes.rows[DataService.groupNum-1].doc.votes;
        $scope.markers = DataService.mapsetting.markers;
        $scope.locationInfo = "hello lili";
    } 

	serviceInit = function(){
        socket.on('choosegroup', function(data){
            console.log(data);
            groupNum = data.group;
        });
        socket.on('checklocation', function (data) {
        	checklocation(data);
        });
        socket.on('chooselocation', function (data) {
            $scope.chosenNumber = data.location;
        });
    };

    checklocation = function(data){
		if(data.player == $scope.player){
            $scope.currentLocation = data.marker;
            $scope.locationInfo = $scope.markers[$scope.currentLocation-1].data;
            var id = $scope.player+'/'+$scope.currentLocation;
            var vote = $.grep($scope.votes, function(value) {
                return value.id == id;
            });
            if(vote.length>0){
                $scope.voteVal=vote[0].vote;
            }else{
                $scope.voteVal=0;
            }
        	$scope.$apply();
    	}
    }

    updateNote = function(){
        var db = new PouchDB('http://localhost:5984/framework');
        db.get('note_'+$scope.groupNum).then(function(doc){
            return db.put({
                notes:$scope.notes
            }, 'note_'+$scope.groupNum, doc._rev);
        });
    }
    updateVote = function(){
        var db = new PouchDB('http://localhost:5984/framework');
        db.get('vote_'+$scope.groupNum).then(function(doc){
            return db.put({
                votes:$scope.votes
            }, 'vote_'+$scope.groupNum, doc._rev);
        });
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
    	updateNote();
    	socket.emit('addlocalnote', {notes:$scope.notes});
    }
    $scope.deleteLocalNote = function($event){
    	// return the text of <p>
    	var content = $event.target.parentElement.firstElementChild.textContent;
        // keep all the notes expect the one has value of "content"
        $scope.notes = $.grep($scope.notes, function(value) {
		 	return value.content != content;
		});
		updateNote();
    	socket.emit('deletelocalnote', {notes:$scope.notes});
    }
    $scope.evaluateLocation = function(value){
        $scope.voteVal = value;
        var color = ['#d9534f','#ec971f','#31b0d5','#337ab7','#449d44'];
        var caption= ['Très Faible', 'Faible', 'Moyen', 'Bon', 'Très Bon'];
        var location = $scope.currentLocation;
        var label = $('#evaluation .caption');
        label.text(caption[value-1]);
        label.css('background-color', color[value-1]);
        // update $scope.votes
        var id = $scope.player+'/'+location;
        var vote = $.grep($scope.votes, function(value) {
            return value.id == id;
        });
        var newVote = false;
        if(vote.length>0){
            var index = $scope.votes.indexOf(vote[0]);
            $scope.votes[index].vote = value;
            newVote = false;
        }else {
            var newVote={
                id: id,
                player: $scope.player,
                location: $scope.currentLocation,
                vote: value
            }
            $scope.votes.push(newVote);
            newVote = true;
        }
        // store new vote to db
        updateVote();
        socket.emit('vote', {location: $scope.currentLocation, group: $scope.chosenNumber, player: $scope.player, newvote:newVote, id: id, votes: $scope.votes});
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
    serviceInit();
    getData();
});
