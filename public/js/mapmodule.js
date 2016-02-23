var mapModule = angular.module("MapModule", ["leaflet-directive"]);

mapModule.controller('DOMCtrl', function($scope, $timeout, DataService){
    $scope.range = function(n) {
        return new Array(n);   
    }
    //!!!!todo,delete some var
    $scope.getAppData = function(){
        $scope.longtitude = parseFloat(DataService.mapsetting.longtitude);
        $scope.laititude = parseFloat(DataService.mapsetting.laititude);
        $scope.locationAmount = DataService.mapsetting.markers.length;
        $scope.studentAmount = parseInt(DataService.studentAmount);
        $scope.avatarWidth = Math.round(12/$scope.studentAmount);
        $scope.markers = DataService.mapsetting.markers;
        $scope.steps = DataService.mapsetting.steps;
        $scope.allRating = 0;
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

    $scope.serviceInit = function(){
        console.log("service init");
    }
    $scope.nextStep = function($event,step){
        if($scope.currentStep == step){
            var element = $event.target.parentElement;
            $(element.children[0]).removeClass('glyphicon-unchecked');
            $(element.children[0]).addClass('glyphicon-check');
            if(step<$scope.steps.length-1){
                $(element.nextElementSibling.children).css('color', '#E0E0E0');
            }
            $scope.currentStep++;
        }
    }
    $scope.checkLocation = function($event,marker,player){
        var socket = io.connect('http://localhost:8000');
    	console.log(marker,player);
        socket.emit('checklocation', { location: marker, player: player, group: $scope.groupnum});

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
    $scope.init = function(){
        $scope.getAppData();
        //--------------------initialize DOM
        // $scope.domInit();
        //--------------------initialize service
        $scope.serviceInit();
        
        // Server.attachNotes();
        // Server.attachRating();
    }
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
    });

    $scope.init();
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
        for(var i=0; i<locationAmount;i++){
            var num = i+1;
            var marker={
                lat: Number(mapsetting.markers[i].laititude),
                lng: Number(mapsetting.markers[i].longtitude),
                getMessageScope: function () { return $scope; },
                message: '<div id="marker'+num+'" class="mapMarker"><h3>'+mapsetting.markers[i].name+'</h3><button type="button" class="btn player1 markerBtn" ng-click="checkLocation($event,'+num+',1)"><img src="/img/player1.png"></button><button type="button" class="btn player2 markerBtn" ng-click="checkLocation($event,'+num+',2)"><img src="/img/player2.png"></button><button type="button" class="btn player3 markerBtn" ng-click="checkLocation($event,'+num+',3)"><img src="/img/player3.png"></button></div>',
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
        socket.emit('checklocation', { location: marker, player: player, group: DataService.groupnum});

        var element = $event.currentTarget;
        var className = element.className;
        var elements = document.getElementsByClassName(className);
        $(elements).css({'background-color': '#5bc0de', 'border-color': '#46b8da'});
        $(element).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
        $($(elements)[marker-1]).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
    }
    $scope.addMarkers();
}]);