var playerModule = angular.module("PlayerModule", []);

playerModule.controller('PlayerCtrl', function($scope, DataService,$timeout){
	// var socket = io.connect('http://localhost:8000');
    var socket = io.connect('https://myoa.herokuapp.com');

    $scope.range = function(n) {
        return new Array(n);   
    }
    // get data from DataService 
    getData = function(){
        // get player number
        $scope.player = DataService._indexPlayer+1;
        $scope.playerName = DataService.group.students[DataService._indexPlayer];
        // get group number
        $scope.groupNum = DataService._indexGroup+1;
        // get sequence type and steps
        var doc = DataService.app;
        $scope.seqtype = doc.mapstep2.seqtype;
        ($scope.seqtype == "restricted")?($scope.steps = doc.mapstep2.reseq):($scope.steps = doc.mapstep2.unseq);
        // get current step, check whether there is s0 or not
        ($scope.steps.s0.exist == false)?($scope.currentStep = 1):($scope.currentStep = 0);
        $scope.shownStep = 1;
        // get the evaluation type
        ($scope.steps.s1.eval)?($scope.evaltype = $scope.steps.s1.eval):($scope.evaltype = "group");

        $scope.crisTea = doc.mapstep1.cris.teacher;
        $scope.crisStu = doc.mapstep1.cris.student;
        // $scope.cris = $scope.crisTea.concat($scope.crisStu);
        $scope.notes=[];
        $scope.commonNotes=[];
        // $scope.notes = DataService.notes.rows[DataService.groupNum-1].doc.notes;
        // $scope.commonNotes = DataService.notes.rows[DataService.groupNum-1].doc.common;
        // $scope.voteValue = DataService.votes.rows[DataService.groupNum-1].doc.votes;
        $scope.evalVal = [];
        $scope.markers = doc.mapstep1.markers;
        $scope.locationInfo = "(Choisissez un emplacement sur l'écran partagé.)";
        $scope.device = doc.mapstep4.device;
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
            $scope.shownStep++;
            if($scope.currentStep == 1){
                $scope.cris = $scope.crisTea.concat($scope.crisStu);
            }
            $scope.$apply();
        })
        socket.on('evalonshare', function (data) {
            // {group: $scope.groupNum, location: locationNum, cri: criNum, value: value}
            if($scope.groupNum !== data.group || $scope.currentLocation !== data.location) return;
            $scope.evalVal[data.cri]=data.value;
            $scope.$apply();
        });
        socket.on('agreecri', function(data){
            if(data.group !== $scope.groupNum || data.player == $scope.player) return;
            $scope.newCri = data.cri;
            $scope.$apply();
            $('#agreeCri').dialog('open');

        });
        socket.on('successcri', function(data){
            if(data.group !== $scope.groupNum) return;
            $scope.crisStu.push(data.cri);
            $scope.$apply();

        });
        socket.on('deletecri', function (data){
           if(data.group !== $scope.groupNum || data.player == $scope.player) return;
           $scope.crisStu = $.grep($scope.crisStu, function(value) {
                return value.id != data.id;
            });
           $scope.$apply();
        });
        // in a "group" evaluation mode, when one player submits a eval, other players who's having the same location on the tablet should also receive an updated eval
        socket.on('evaluate', function(data){
            if($scope.evaltype == "individual") return;

            if($scope.groupNum !== data.group || $scope.currentLocation !== data.location) return;
            $scope.evalVal[data.cri]=data.value;
            $scope.$apply();
        })
    };
    // load data, vote and note of a location
    checklocation = function(data){
		if(data.player == $scope.player){
            $scope.currentLocation = data.location;
            var symbol = $scope.markers[$scope.currentLocation-1].icon.icon;
            var name = $scope.markers[$scope.currentLocation-1].name;
            $scope.locationTitle = symbol + ". " + name;
            $scope.locationInfo = $scope.markers[$scope.currentLocation-1].data;
            var id = $scope.player+'/'+$scope.currentLocation;
            $scope.evalVal = data.vote;
            $scope.notes = data.note;
            $scope.currentLocalNote="";
        	$scope.$apply();
    	}
    }
    // update note to the database
    updateNote = function(){
        var db = new PouchDB('https://myoa.smileupps.com/user');
        
        // db.get('note_'+$scope.groupNum).then(function(doc){
        //     return db.put({
        //         notes:$scope.notes,
        //         common:$scope.commonNotes
        //     }, 'note_'+$scope.groupNum, doc._rev);
        // });
    }
    // update vote to the database
    updateVote = function(){
        var db = new PouchDB('https://myoa.smileupps.com/user');

        // db.get('vote_'+$scope.groupNum).then(function(doc){
        //     return db.put({
        //         votes:$scope.votes
        //     }, 'vote_'+$scope.groupNum, doc._rev);
        // });
    }
    $scope.addCri = function($event){
        if(!$scope.currentCri){
            $('#writeNoteDlg').dialog('open');
            return;
        }
        var id = "cri"+$scope.player+'/'+Math.random();
        $scope.newCri = {
            name: $scope.currentCri,
            id:id
        };
        socket.emit('addcri',{group: $scope.groupNum, cri: $scope.newCri, player: $scope.player});
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
        socket.emit('deletecri', {group: $scope.groupNum, id: id, player:$scope.player});
    }  
    // add note on the common space
    $scope.addCommonNote = function($event){
        // if(!$scope.currentCommonNote){
        //     $('#writeNoteDlg').dialog('open');
        //     return;
        // }
        var id=$scope.player+'/'+Math.random();
        var currentCommonNote = {
            player:$scope.player,
            content: $scope.currentCommonNote,
            id: id
        }
        // updateNote();
        socket.emit('addcommonnote', {player: $scope.player, group: $scope.groupNum, newnote: currentCommonNote});

        $scope.commonNotes.push(currentCommonNote);
        $scope.currentCommonNote=undefined;
    }    
    // add note on a location card
    $scope.addLocalNote = function($event){
    	if(!$scope.currentLocation){
			$('#chooseLocationDlg').dialog('open');
			return;
    	}
    	// if(!$scope.currentLocalNote){
     //        $('#writeNoteDlg').dialog('open');
     //        return;
     //    }
        var id=$scope.player+'/'+Math.random();
    	var currentLocalNote = {
    		player: $scope.player,
    		location: $scope.currentLocation,
    		content: $scope.currentLocalNote,
            id: id
    	}
        socket.emit('addlocalnote', {player: $scope.player, group: $scope.groupNum, location:$scope.currentLocation, newnote:currentLocalNote});
        // updateNote();
        $scope.notes.push(currentLocalNote);
    	$scope.currentLocalNote=undefined;
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
        // updateNote();
        socket.emit('deletecommonnote', {player: $scope.player, group: $scope.groupNum, noteid: id});
    }    // delete note on a location card
    $scope.deleteLocalNote = function($event){
    	// return the text of <p>
    	var id = $event.target.id;
        // keep all the notes expect the one has id of "id"
        $scope.notes = $.grep($scope.notes, function(value) {
		 	return value.id != id;
		});
        // update database
		// updateNote();
    	socket.emit('deletelocalnote', {player: $scope.player, group: $scope.groupNum, location:$scope.currentLocation, noteid:id});
    }
    // submit evaluation of one location
    $scope.changeEval = function(index,value){
        if(!$scope.currentLocation){
            $('#chooseLocationDlg').dialog('open');
            return;
        }
        var newVote;

        if($scope.evalVal[index] == undefined){
            $scope.evalVal[index] = value;
            // clone the evalVal array
            var newarray = $scope.evalVal.slice(0);
            // check if there is null in other array
            var nullExist = newarray.reduce(function(a,b){return a&&b;});
            (nullExist == null)?(newVote = false):(newVote = true);
        }else{
            $scope.evalVal[index] = value;
            newVote = false;
        }
               
        // store new vote to db
        // updateVote();
        socket.emit('evaluate', {group: $scope.groupNum, location: $scope.currentLocation, cri:index, player: $scope.player, newvote:newVote, value: value});
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
        $( '#agreeCri' ).dialog({
            autoOpen: false,
            height:200,
            modal: true,
            buttons:{
                "Yes": function(){
                    $(this).dialog("close");
                    socket.emit('confirmcri', {group: $scope.groupNum, playeramount: DataService.group.studentamount, cri: $scope.newCri});
                },
                "No": function(){
                    $(this).dialog("close");
                }
            }
        });
    });
    serviceInit();
    getData();
});
