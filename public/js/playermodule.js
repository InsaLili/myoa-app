var playerModule = angular.module("PlayerModule", []);

playerModule.controller('PlayerCtrl', function($scope, DataService,$timeout){
	var socket = io.connect('http://localhost:8000');

    $scope.range = function(n) {
        return new Array(n);   
    }
    // get data from DataService 
    getData = function(){
        // get player number
        $scope.player = DataService._indexPlayer+1;
        // get group number
        $scope.groupNum = DataService._indexGroup+1;
        // get student amount
        $scope.studentAmount = parseInt(DataService.groups[DataService._indexGroup].student);
        // get sequence type and steps
        var doc = DataService.docs[DataService._indexApp];
        $scope.seqtype = doc.mapstep2.seqtype;
        ($scope.seqtype == "restricted")?($scope.steps = doc.mapstep2.reseq):($scope.steps = doc.mapstep2.unseq);
        // get current step, check whether there is s0 or not
        ($scope.steps.s0.title)?($scope.currentStep = 0):($scope.currentStep = 1);
        // get the evaluation type
        ($scope.steps.s1.eval)?($scope.evaltype = $scope.steps.s1.eval):($scope.evaltype = "group");

        $scope.crisTea = doc.mapstep1.cris.teacher;
        $scope.crisStu = doc.mapstep1.cris.student;
        $scope.cris = $scope.crisTea.concat($scope.crisStu);
        $scope.notes=[];
        $scope.commonNotes=[];
        // $scope.notes = DataService.notes.rows[DataService.groupNum-1].doc.notes;
        // $scope.commonNotes = DataService.notes.rows[DataService.groupNum-1].doc.common;
        // $scope.voteValue = DataService.votes.rows[DataService.groupNum-1].doc.votes;
        $scope.evalVal = [];
        $scope.markers = doc.mapstep1.markers;
        $scope.locationInfo = "hello lili";
        // $scope.add = DataService.mapsetting.additional;
        // $scope.like = false;
    } 
    // communication between devices
	serviceInit = function(){
        socket.on('checklocation', function (data) {
            if(data.group !== $scope.groupNum) return;
        	checklocation(data);
        });
        socket.on('changestep', function (data){
            if(data.group !== $scope.groupNum) return;
            $scope.currentStep = data.step;
            if($scope.currentStep == 1){
                $scope.cris = $scope.crisTea.concat($scope.crisStu);
            }
            $scope.$apply();
        })
        socket.on('evalOnShare', function (data) {
            // {group: $scope.groupNum, location: locationNum, cri: criNum, value: value}
            var location = data.location+1;
            if($scope.groupNum !== data.group || $scope.currentLocation !== location) return;
            $scope.evalVal[data.cri]=data.value;
            $scope.$apply();
        });
    };
    // load data, vote and note of a location
    checklocation = function(data){
		if(data.player == $scope.player){
            $scope.currentLocation = data.location;
            $scope.locationInfo = $scope.markers[$scope.currentLocation-1].data;
            var id = $scope.player+'/'+$scope.currentLocation;
            $scope.evalVal = data.vote;
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
    $scope.addCri = function($event){
        if(!$scope.currentCri){
            $('#writeNoteDlg').dialog('open');
            return;
        }
        var id = "cri"+$scope.player+'/'+Math.random();
        var newCri = {
            name: $scope.currentCri,
            id:id
        };
        $scope.crisStu.push(newCri);
        socket.emit('addcri',{group: $scope.groupNum, cri: newCri});
        $scope.currentCri = '';
    }
    // delete note on the common space
    $scope.deleteCri = function($event){
        // return the text of <p>
        var id = $event.target.id;
        // keep all the notes expect the one has id of "id"
        $scope.crisStu = $.grep($scope.crisStu, function(value) {
            return value.id != id;
        });
        socket.emit('deletecri', {group: $scope.groupNum, id: id});
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
        socket.emit('addcommonnote', {player: $scope.player, group: $scope.groupNum, notes:$scope.commonNotes});
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
    	socket.emit('addlocalnote', {player: $scope.player, group: $scope.groupNum, location:$scope.currentLocation, notes:$scope.notes});
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
        socket.emit('deletecommonnote', {player: $scope.player, group: $scope.groupNum, notes:$scope.commonNotes});
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
    	socket.emit('deletelocalnote', {player: $scope.player, group: $scope.groupNum, location:$scope.currentLocation, notes:$scope.notes});
    }
    // submit evaluation of one location
    $scope.changeEval = function(index,value){
        if(!$scope.currentLocation){
            $('#chooseLocationDlg').dialog('open');
            return;
        }
        var newVote;
        if($scope.evalVal[index] == undefined){
            // clone the evalVal array
            var newarray = $scope.evalVal.slice(0);
            // 
            newarray.splice(index,1);
            var nullExist = newarray.reduce(function(a,b){return a&&b;});
            (nullExist == null)?(newVote = false):(newVote = true);
        }else{
            newVote = false;
        }
        $scope.evalVal[index] = value;
               
        // store new vote to db
        // updateVote();
        socket.emit('evaluate', {group: $scope.groupNum, location: $scope.currentLocation, cri:index, player: $scope.player, newvote:newVote, value: value});
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
