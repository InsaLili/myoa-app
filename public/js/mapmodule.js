var mapModule = angular.module("MapModule", ["leaflet-directive"]);

mapModule.controller('DOMCtrl', function($scope, $timeout, DataService){
    $scope.range = function(n) {
        return new Array(n);   
    }
    //!!!!todo,delete some var
    getAppData = function(){
        $scope.longtitude = parseFloat(DataService.mapsetting.longtitude);
        $scope.laititude = parseFloat(DataService.mapsetting.laititude);
        $scope.locationAmount = DataService.mapsetting.markers.length;
        $scope.studentAmount = parseInt(DataService.studentAmount);
        $scope.avatarWidth = Math.round(12/$scope.studentAmount);
        $scope.markers = DataService.mapsetting.markers;
        $scope.steps = DataService.mapsetting.steps;
        $scope.notes = DataService.notes.rows[DataService.groupNum-1].doc.notes;
        $scope.commonNotes = DataService.notes.rows[DataService.groupNum-1].doc.common;
        $scope.votes = DataService.votes.rows[DataService.groupNum-1].doc.votes;
        $scope.allVotes = $scope.studentAmount*($scope.markers.length);
        $scope.currentStep = 1;
        $scope.add = DataService.mapsetting.additional;
        $scope.add.noteNum = Number($scope.add.noteNum);
        $scope.groupName = DataService.mapsetting.groups[DataService.groupNum-1].name;
        $scope.locationNames = function(){
            var names = [];
            for(var i=0; i<$scope.locationAmount;i++){
                names.push($scope.markers[i].name)
            }
            return names;
        }
        $scope.locationCoordinates = function(){
            var coordinates=[];
            for(var i=0; i<$scope.locationAmount;i++){
                var content=[Number($scope.markers[i].longtitude),Number($scope.markers[i].laititude)];
                coordinates.push(content);
            }
            return coordinates;
        }
        console.log($scope.locationNames());
        console.log($scope.locationCoordinates());
    }

    serviceInit = function(){
        var db = new PouchDB('http://localhost:5984/insect');
        var socket = io.connect('http://localhost:8000');
        //------following parts realize the communication between pages
        socket.on('addlocalnote', function (data) {
            $scope.notes = data.notes;
            $scope.studentNotes[data.player-1]++;
            $scope.$apply();
            console.log($scope.studentNotes);
        });

        socket.on('deletelocalnote', function (data) {
            $scope.notes = data.notes;
            $scope.studentNotes[data.player-1]--;
            $scope.$apply();
            console.log($scope.studentNotes);
        });

        socket.on('addcommonnote', function (data) {
            $scope.commonNotes = data.notes;
            $scope.studentNotes[data.player-1]++;

            $scope.$apply();
            console.log($scope.studentNotes);
        });

        socket.on('deletecommonnote', function (data) {
            $scope.commonNotes = data.notes;
            $scope.studentNotes[data.player-1]--;
            $scope.$apply();
            console.log($scope.studentNotes);
        });

        socket.on('vote', function(data){
            if($scope.add.eval == 'star'){
                updateStar(data);
            }else if($scope.add.eval == "heart"){
                updateHeart(data);
            }
        });
    }

    attachStar = function(){
        $scope.voteAmount=[];
        var progressbarText = $('.player p');

        // filte all the players, i is the number of player
        for(var i=0; i<$scope.studentAmount;i++){
            var player = i+1;
            var votes = $.grep($scope.votes, function(value) {
                return value.player == player;
            });
            var voteNum = votes.length;
            $( "#progressbar"+player ).progressbar({
                value: voteNum
            });
            $(progressbarText[i]).text(voteNum + '/'+$scope.locationAmount+' Emplacements');
            $scope.voteAmount.push(voteNum);
            // check all the location for the i player, change the checkmark color
            for(var j=0; j<voteNum;j++){
                var vote = votes[j];
                var location = vote.location;
                var checkMark = $('#location'+location+' .glyphicon-ok-circle')[i];
                $(checkMark).removeClass('grey');
                $(checkMark).addClass('checked');
            }
        }
        console.log($scope.voteAmount);
    }
    attachHeart = function(){
        $scope.voteValue=[];
        for(var i=1;i<=$scope.locationAmount;i++){
            var locationVote = [];
            var votes = $.grep($scope.votes, function(value){
                return value.location == i;
            });
            for(var j=1;j<=$scope.studentAmount;j++){
                var votePlayer = $.grep(votes, function(value){
                    return value.player == j;
                });
                if(votePlayer.length>0){
                    locationVote.push(votePlayer[0].vote);
                }else{
                    locationVote.push(0);
                }
            }
            $scope.voteValue.push(locationVote);
        }
    }
    attachNotes = function(){
        $scope.studentNotes=[];
        for(var i=0; i<$scope.studentAmount;i++){
            var player = i+1;
            var notes = $.grep($scope.notes, function(value) {
                return value.player == player;
            });
            var commonnotes = $.grep($scope.commonNotes, function(value) {
                return value.player == player;
            });
            var allnote = notes.length+commonnotes.length;
            $scope.studentNotes.push(allnote);
        }
        console.log("notes number");
        console.log($scope.studentNotes);
    }
    dialogInit = function(){
        var steps = $scope.steps.length;
        $( ".dialog").dialog({
            autoOpen: false,
            resizable: false,
            width:600,
            height:420,
            modal: true,
            buttons: {
                "Commencer": function(){
                    $(this).dialog( "close" );
                    var step = Number(this.id.match(/\d/)[0])
                    timerInit(step);
                }
            }
        });
        $( "#chooseDialog").dialog({
            autoOpen: false,
            resizable: false,
            width:600,
            height:420,
            modal: true,
            buttons: {
                "Oui": function() {
                    $( this ).dialog( "close" );
                    confirmChoice();
                },
                "Non": function() {
                    $( this ).dialog( "close" );
                }
            }
        });

    }
    timerInit = function(step){
        // remove the former timer
        var num = step-1;
        if($('#timer'+num).length !== 0){
            clearInterval(intervals.main);
            $('#timer'+num).remove();
        }
        // add a new timer
        if($scope.steps[num].timer == 'true'){
            $('#timer'+step).countdown({
                image: "/img/digits.png",
                format: "mm:ss",
                startTime: $scope.steps[num].timerval
            });
        }
    }
    updateStar = function(data){
        $scope.votes = data.votes;
        // if it is not a new vote, do nothing
        if(data.newvote == false){
            return;
        } 
        var location = data.location;
        var player = data.player;
        var id = data.id;
        // add player's vote progress
        $scope.voteAmount[player-1]++;
        // update progressbar
        var voteNum = $scope.voteAmount[player-1];
        var progressbarText = $('.player p');
        $( "#progressbar"+player ).progressbar({
            value: voteNum
        });
        $(progressbarText[player-1]).text(voteNum + '/'+$scope.locationAmount+' Emplacements');
        // update checkmark
        var checkMark = $('#location'+location+' .glyphicon-ok-circle')[player-1];
        $(checkMark).removeClass('grey');
        $(checkMark).addClass('checked');
    }
    updateHeart = function(data){
        $scope.voteValue[data.location-1][data.player-1] = data.value;
        $scope.$apply();
    }

    showVote = function(){
        $scope.voteValue = [];
        var color = ['#d9534f','#ec971f','#31b0d5','#337ab7','#449d44'];
        var caption= ['Très Faible', 'Faible', 'Moyen', 'Bon', 'Très Bon'];
        
        for(var i=0; i<$scope.locationAmount;i++){
            // get all the votes for the same location i
            var votes = $.grep($scope.votes, function(value){
                return value.location == i+1;
            });
            var value=0;
            for(var j=0; j<$scope.studentAmount;j++){
                value += votes[j].vote;
            }
            value = Math.round(value/$scope.studentAmount);
            // change star color
            $scope.voteValue.push(value);
            // change caption
            var location = i+1;
            var label = $('#vote'+location+' .caption');
            label.text(caption[value-1]);
            label.css('background-color', color[value-1]);
        }
    }
    confirmChoice = function(){
        $('.location').hide();
        $('#location'+$scope.chosenNum).show();
        $('.chooseLocation').hide();
    }
    $scope.nextStep = function($event,step){
        if(($scope.votes.length == $scope.allVotes)||($scope.add.eval == 'heart')){
            if($scope.currentStep == step){
                var element = $event.target.parentElement;
                $(element.children[0]).removeClass('glyphicon-unchecked');
                $(element.children[0]).addClass('glyphicon-check');

                if(step == 1){
                    if($scope.add.eval == 'star') showVote();
                    $(".chooseLocation").show();
                }
                if(step<$scope.steps.length){
                    $(element.nextElementSibling.children).css('color', '#E0E0E0');
                }
                $scope.currentStep++;
                $('#dialog'+$scope.currentStep).dialog('open');
            }
        }
    }
    $scope.checkLocation = function($event,marker,player){
        var socket = io.connect('http://localhost:8000');
    	console.log(marker,player);
        socket.emit('checklocation', { marker: marker, player: player, group: DataService.groupNum});

        var element = $event.currentTarget;
        var className = element.className;
        var elements = document.getElementsByClassName(className);
        $(elements).css({'background-color': '#5bc0de', 'border-color': '#46b8da'});
        $(element).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
        $($(elements)[marker-1]).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
    }    
    $scope.chooseLocation = function(marker,name){
    	console.log(marker,name);
        $scope.chosenTitle = name;
        $scope.chosenNum = marker;
        $('#chooseDialog').dialog('open');
    }
    init = function(){
        // get data and initialize service
        getAppData();
        serviceInit();
        attachNotes();
    }
    // wait for dom ready
    $timeout(function(){
        // initiate progress bar
        for(var i=0; i<$scope.studentAmount;i++){
            var num = i+1;
            $( "#progressbar"+num ).progressbar({
            max: $scope.locationAmount
        });
        }
        $( ".progressbar" ).on( "progressbarcomplete", function( event, ui ) {
            $scope.allRating++;
        });
        $('.location').touch();
        $('#commonSpace').touch();
        // $('.chooseLocation').hide();
        $("#step0 p").css('color', '#E0E0E0');
        $("#step0 span").css('color', '#E0E0E0');
        $(".chooseLocation").hide();

        if($scope.add.eval == 'star'){
            attachStar();
        }else if($scope.add.eval == 'heart'){
            attachHeart();
        }

        dialogInit();
        $('#dialog1').dialog('open');
    });

    init();
});

mapModule.controller("MapCtrl", [ "$scope", "$http", "DataService",function($scope, $http, DataService) {
    var mapsetting = DataService.mapsetting;
    var socket = io.connect('http://localhost:8000');
    $scope.commonSpace = mapsetting.additional.commonspace;
    angular.extend($scope, {
        center: {
            lat: Number(mapsetting.laititude),
            lng: Number(mapsetting.longtitude),
            zoom: 15
        },
        tiles: {
            name: 'MYOA',
            url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
            type: 'xyz',
            options: {
                apikey: 'pk.eyJ1IjoiaW5zYWxpbGkiLCJhIjoickF1VzlYVSJ9.JH9ZrV76fbU5Ub9ZgBhNCw',
                mapid: 'insalili.meikk0a8'
            }
        },
        geojson: {},
        markers: []
    });

    $http.get("data/map.geo.json").success(function(data){
        $scope.geojson.data = data;
    });

    $scope.addMarkers = function(){
        var locationAmount = mapsetting.markers.length;
        var studentAmount = parseInt(DataService.studentAmount);
        for(var i=0; i<locationAmount;i++){
            var num = i+1;
            var message = '<div id="marker'+num+'" class="mapMarker"><h3>'+mapsetting.markers[i].name+'</h3>';
            for(var j=1; j<=studentAmount;j++){
                message += '<button type="button" class="btn player'+j+' markerBtn" ng-click="checkLocation($event,'+num+','+j+')"><img src="/img/player'+j+'.png"></button>'
            }
            message += '</div>';
            var marker={
                lat: Number(mapsetting.markers[i].laititude),
                lng: Number(mapsetting.markers[i].longtitude),
                getMessageScope: function () { return $scope; },
                message: message,
                compileMessage: true,
                icon:{
                    type: 'makiMarker',
                    icon: num,
                    color: '#E91E63',
                    size: "l"
                }
            };
            $scope.markers.push(marker);
        }
    }

    $scope.checkLocation = function($event,marker,player){
        console.log(marker,player);
        socket.emit('checklocation', { marker: marker, player: player, group: DataService.groupNum});

        var element = $event.currentTarget;
        var className = element.className;
        var elements = document.getElementsByClassName(className);
        $(elements).css({'background-color': '#5bc0de', 'border-color': '#46b8da'});
        $(element).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
        $($(elements)[marker-1]).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
    }
    $scope.addMarkers();
}]);