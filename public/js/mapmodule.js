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
        $scope.votes = DataService.votes.rows[DataService.groupNum-1].doc.votes;
        $scope.allVotes = $scope.studentAmount*($scope.markers.length);
        $scope.currentStep = 0;
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
            $scope.$apply();
            // var noteHeight = $('#location'+location+' .note').height();
            // if(noteHeight+260 > 400){
            //     $('#location'+location).height(noteHeight + 260 +'px');
            // }else{
            //     $('#location'+location).height(400+'px');
            // }
        });

        socket.on('deletelocalnote', function (data) {
            $scope.notes = data.notes;
            $scope.$apply();
            // if(noteHeight+260 > 400){
            //     $('#location'+location).height(noteHeight + 260 +'px');
            // }else{
            //     $('#location'+location).height(400+'px');
            // }
        });

        socket.on('addagu', function (data) {
            console.log(data);
            var id = data.id;
            var content = data.content;
            var player = data.player;
            var location = parseInt(data.location);
            //    var location = data.location;
            $('.arguments span').append('<p id='+id+' class="aguPlayer'+player+'">'+content+'</p>');
            var noteHeight = $('#location'+location+' .note').height();
            var aguHeight = $('#location'+location+' .arguments').height();
            if(aguHeight > 130){
                $('#location'+location).height(noteHeight + aguHeight + 270 +'px');
            }else{
                $('#location'+location).height(noteHeight+400+'px');
            }
        });



        socket.on('deleteagu', function (data) {
            console.log(data);
            var id = data.id;
            $('#'+id).remove();
            var location = data.location;
            var player = data.player;
            var noteHeight = $('#location'+location+' .note').height();
            var aguHeight = $('#location'+location+' .arguments').height();
            if(aguHeight > 130){
                $('#location'+location).height(noteHeight + aguHeight + 270 +'px');
            }else{
                $('#location'+location).height(noteHeight+400+'px');
            }
        });

        socket.on('vote', function(data){
            updateVote(data);
        });
    }
    attachProgress = function(){
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
                var checkMark = $('#location'+location+' span')[i];
                $(checkMark).removeClass('grey');
                $(checkMark).addClass('star-best');
            }
        }

        console.log($scope.voteAmount);
    }
    updateVote = function(data){
        $scope.votes = data.votes;
        // 
        if(data.newvote == false){
            return;
        } 

        var location = data.location;
        var player = data.player;
        var id = data.id;
        $scope.voteAmount[player-1]++;
        // update progressbar
        var voteNum = $scope.voteAmount[player-1];
        var progressbarText = $('.player p');
        $( "#progressbar"+player ).progressbar({
            value: voteNum
        });
        $(progressbarText[player-1]).text(voteNum + '/'+$scope.locationAmount+' Emplacements');
        // update checkmark
        var checkMark = $('#location'+location+' span')[player-1];
        $(checkMark).removeClass('grey');
        $(checkMark).addClass('star-best');
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
    $scope.nextStep = function($event,step){
        if($scope.votes.length == $scope.allVotes){
            if($scope.currentStep == step){
                var element = $event.target.parentElement;
                $(element.children[0]).removeClass('glyphicon-unchecked');
                $(element.children[0]).addClass('glyphicon-check');
                if(step == 0){
                    showVote();
                }
                if(step<$scope.steps.length-1){
                    $(element.nextElementSibling.children).css('color', '#E0E0E0');
                }
                $scope.currentStep++;
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
    $scope.chooseLocation = function($event,marker,name){
    	console.log(marker,name);
    }
    init = function(){
        // get data and initialize service
        getAppData();
        serviceInit();
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
        // $('.chooseLocation').hide();
        $("#step0 p").css('color', '#E0E0E0');
        $("#step0 span").css('color', '#E0E0E0');
        $(".chooseLocation").hide();

        attachProgress();
    });

    init();
});

mapModule.controller("MapCtrl", [ "$scope", "$http", "DataService",function($scope, $http, DataService) {
    var mapsetting = DataService.mapsetting;
    var socket = io.connect('http://localhost:8000');

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
        socket.emit('checklocation', { location: marker, player: player, group: DataService.groupNum});

        var element = $event.currentTarget;
        var className = element.className;
        var elements = document.getElementsByClassName(className);
        $(elements).css({'background-color': '#5bc0de', 'border-color': '#46b8da'});
        $(element).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
        $($(elements)[marker-1]).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
    }
    $scope.addMarkers();
}]);