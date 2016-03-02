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
    // get data from DataService 
    getData = function(){
        $scope.player = DataService.studentNum;
        $scope.groupNum = DataService.groupNum;
        $scope.notes = DataService.notes.rows[DataService.groupNum-1].doc.notes;
        $scope.commonNotes = DataService.notes.rows[DataService.groupNum-1].doc.common;
        $scope.votes = DataService.votes.rows[DataService.groupNum-1].doc.votes;
        $scope.markers = DataService.mapsetting.markers;
        $scope.locationInfo = "hello lili";
        $scope.add = DataService.mapsetting.additional;
        $scope.like = false;
        $scope.caption= ['Pas Encore Évalué','Très Faible', 'Faible', 'Moyen', 'Bon', 'Très Bon'];

    } 
    // communication between devices
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
    // load data, vote and note of a location
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
            // update caption
            if($scope.add.eval == 'star'){
                var color = ['##777','#d9534f','#ec971f','#31b0d5','#337ab7','#449d44'];
                var location = $scope.currentLocation;
                var label = $('#evaluation .caption');
                label.css('background-color', color[$scope.voteVal]);
            }
        	$scope.$apply();
    	}
    }
    // update note to the database
    updateNote = function(){
        var db = new PouchDB('http://localhost:5984/framework');
        db.get('note_'+$scope.groupNum).then(function(doc){
            return db.put({
                notes:$scope.notes,
                common:$scope.commonNotes
            }, 'note_'+$scope.groupNum, doc._rev);
        });
    }
    // update vote to the database
    updateVote = function(){
        var db = new PouchDB('http://localhost:5984/framework');
        db.get('vote_'+$scope.groupNum).then(function(doc){
            return db.put({
                votes:$scope.votes
            }, 'vote_'+$scope.groupNum, doc._rev);
        });
    }
    // add note on the common space
    $scope.addCommonNote = function($event){
        if(!$scope.currentCommonNote){
            $('#writeNoteDlg').dialog('open');
            return;
        }
        var id=$scope.player+'/'+Math.random();
        var currentCommonNote = {
            player:$scope.player,
            content: $scope.currentCommonNote,
            id: id
        }
        $scope.commonNotes.push(currentCommonNote);
        $scope.currentCommonNote=undefined;
        updateNote();
        socket.emit('addcommonnote', {player: $scope.player, notes:$scope.commonNotes});
    }    
    // add note on a location card
    $scope.addLocalNote = function($event){
    	if(!$scope.currentLocation){
			$('#chooseLocationDlg').dialog('open');
			return;
    	}
    	if(!$scope.currentLocalNote){
            $('#writeNoteDlg').dialog('open');
            return;
        }
        var id=$scope.player+'/'+Math.random();
    	var currentLocalNote = {
    		player: $scope.player,
    		location: $scope.currentLocation,
    		content: $scope.currentLocalNote,
            id: id
    	}
    	$scope.notes.push(currentLocalNote);
    	$scope.currentLocalNote=undefined;
    	updateNote();
    	socket.emit('addlocalnote', {player: $scope.player, location:$scope.currentLocation, notes:$scope.notes});
    }
    // delete note on the common space
    $scope.deleteCommonNote = function($event){
        // return the text of <p>
        var id = $event.target.id;
        // keep all the notes expect the one has id of "id"
        $scope.commonNotes = $.grep($scope.commonNotes, function(value) {
            return value.id != id;
        });
        // update database
        updateNote();
        socket.emit('deletecommonnote', {player: $scope.player, notes:$scope.commonNotes});
    }    // delete note on a location card
    $scope.deleteLocalNote = function($event){
    	// return the text of <p>
    	var id = $event.target.id;
        // keep all the notes expect the one has id of "id"
        $scope.notes = $.grep($scope.notes, function(value) {
		 	return value.id != id;
		});
        // update database
		updateNote();
    	socket.emit('deletelocalnote', {player: $scope.player, location:$scope.currentLocation, notes:$scope.notes});
    }
    // submit evaluation of one location
    $scope.updateStar = function(value){
        if(!$scope.currentLocation){
            $('#chooseLocationDlg').dialog('open');
            return;
        }
        $scope.voteVal = value;
        // set color and description of the caption
        var color = ['#d9534f','#ec971f','#31b0d5','#337ab7','#449d44'];
        var location = $scope.currentLocation;
        var label = $('#evaluation .caption');
        // update caption
        // label.text($scope.caption[value]);
        label.css('background-color', color[value-1]);
        // update $scope.votes
        var id = $scope.player+'/'+location;
        var vote = $.grep($scope.votes, function(value) {
            return value.id == id;
        });
        var newVote = false;
        // if the vote already exists, update the vote value;
        // if not, push a new vote object to the votes array
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
    $scope.updateHeart = function(){
        if(!$scope.currentLocation){
            $('#chooseLocationDlg').dialog('open');
            return;
        }
        if($scope.voteVal == 0){
            $scope.voteVal++;
        }else{
            $scope.voteVal--;
        }
        // update $scope.votes
        var id = $scope.player+'/'+$scope.currentLocation;
        var vote = $.grep($scope.votes, function(value) {
            return value.id == id;
        });
        // if the vote already exists, update the vote value;
        // if not, push a new vote object to the votes array
        if(vote.length>0){
            var index = $scope.votes.indexOf(vote[0]);
            $scope.votes[index].vote = $scope.voteVal;
        }else {
            var newVote={
                id: id,
                player: $scope.player,
                location: $scope.currentLocation,
                vote: $scope.voteVal
            }
            $scope.votes.push(newVote);
        }
        // store new vote to db
        updateVote();
        socket.emit('vote', {location: $scope.currentLocation, group: $scope.chosenNumber, player: $scope.player, id: id, votes: $scope.votes, value: $scope.voteVal});
    }
    // init dialog when dom is ready
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
