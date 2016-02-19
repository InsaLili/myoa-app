var mapModule = angular.module("MapModule", ["leaflet-directive"]);

mapModule.controller('AppCtrl', function($scope, DataService){

	var mapsetting = DataService.mapsetting;
	var socket = io.connect('http://localhost:8000');
    $scope.groupamount = Number(mapsetting.groupnum);
    $scope.allRating = 0;

    $scope.range = function(n) {
        return new Array(n);   
    }
    $scope.chooseGroupNum = function($event,value){
    	$('#appLayer').show();
        $('#maskLayer').hide();
        $scope.groupnum = value;
        socket.emit('choosegroup', { group: $scope.groupnum});
        $scope.getAppData();
        //--------------------initialize DOM
        $scope.domInit();
        //--------------------initialize map
        // $scope.mapInit();
        
        // Server.attachNotes();
        // Server.attachRating();
    }
    //!!!!todo,delete some var
    $scope.getAppData = function(){
    	$scope.longtitude = Number(mapsetting.longtitude);
		$scope.laititude = Number(mapsetting.laititude);
		$scope.locationAmount = mapsetting.markers.length;
		$scope.studentAmount = Number(mapsetting.studentnum);
		$scope.markers = mapsetting.markers;
		$scope.locationNames = function(){
			var names = [];
			for(var i=0; i<$scope.locationAmount;i++){
				names.push(mapsetting.markers[i].name)
			}
			return names;
		}
		$scope.locationCoordinates = function(){
			var coordinates=[];
			for(var i=0; i<$scope.locationAmount;i++){
				var content=[Number(mapsetting.markers[i].longtitude),Number(mapsetting.markers[i].laititude)];
				coordinates.push(content);
			}
			return coordinates;
		}
		console.log($scope.locationNames());
		console.log($scope.locationCoordinates());
    }
    $scope.domInit = function(){
        for(var i=0; i<$scope.studentAmount;i++){
            $( "#progressbar"+i ).progressbar({
            max: $scope.locationAmount
        });
        }
        $( ".progressbar" ).on( "progressbarcomplete", function( event, ui ) {
            $scope.allRating++;
        });
    }

   
    $scope.activeTouch = function(){
    	$('.location').touch();
    }
    $scope.checkLocation = function($event,marker,player){
    	console.log(marker,player);
        socket.emit('chooselocation', { location: marker, player: player, group: $scope.groupnum});

            // $('.visualPlayer'+player).hide();
            // $('div#visualLocation'+location+' .visualPlayer'+player).show();

            var element = $event.currentTarget;
            var className = element.className;
            var elements = document.getElementsByClassName(className);
            $(elements).css({'background-color': '#5bc0de', 'border-color': '#46b8da'});
            $(element).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
            $($(elements)[marker-1]).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
    }    
    $scope.chooseLocation = function($event,marker){
    	console.log(marker);
    }


});

mapModule.controller("MapCtrl", [ "$scope", "$http", "DataService",function($scope, $http, DataService) {
    var mapsetting = DataService.mapsetting;
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
    // angular.extend($scope.data, {markers: {}});

    $http.get("data/map.geo.json").success(function(data){
        $scope.geojson.data = data;
    });

    // angular.extend($scope.data, {
    //     markers: {
    //         m1: {
    //             lat: Number(mapsetting.markers[0].laititude),
    //             lng: Number(mapsetting.markers[0].longtitude),
    //             compileMessage: false,
    //             message: "I'm a static marker",
    //         },
    //     }
    // });

    $scope.addMarkers = function(){
        var locationAmount = mapsetting.markers.length;
        for(var i=0; i<locationAmount;i++){
            var num = i+1;
            var marker={
                lat: Number(mapsetting.markers[i].laititude),
                lng: Number(mapsetting.markers[i].longtitude),
                getMessageScope: function () { return $scope; },
                message: '<div id="marker'+num+'"><h3>'+name+'</h3><button type="button" class="btn player1 markerBtn" value="'+num+',1" ng-click="checkLocation($event,1,1)"><img src="/img/player1.png"></button><button type="button" class="btn player2 markerBtn" value="'+num+',2"><img src="/img/player2.png"></button><button type="button" class="btn player3 markerBtn" value="'+num+',3"><img src="/img/player3.png"></button></div>',
                compileMessage: true,
                icon:{
                    type: 'makiMarker',
                    icon: 'chemist',
                    color: '#E91E63',
                    size: "l"
                }
            };
            $scope.markers.push(marker);
        }
    }

    $scope.addMarkers();

     // $scope.mapInit = function(){
    //     L.mapbox.accessToken = 'pk.eyJ1IjoiaW5zYWxpbGkiLCJhIjoickF1VzlYVSJ9.JH9ZrV76fbU5Ub9ZgBhNCw';
    //     var map = L.mapbox.map('map', 'insalili.meikk0a8', {
    //         zoomControl: false
    //     }).setView([$scope.laititude, $scope.longtitude], 15);
    //     //------------------add markers
    //     var message = [];
    //     for(var i=0; i<$scope.locationAmount; i++){
    //         var self = $scope;
    //         var num = i+1;
    //         var name = $scope.locationNames()[i];
    //         message[i]= '<div id="marker'+num+'"><h3>'+name+'</h3><button type="button" class="btn player1 markerBtn" value="'+num+',1" ng-click="checkLocation($event,1,1)"><img src="/img/player1.png"></button><button type="button" class="btn player2 markerBtn" value="'+num+',2"><img src="/img/player2.png"></button><button type="button" class="btn player3 markerBtn" value="'+num+',3"><img src="/img/player3.png"></button></div>';
    //     }

    //     var myLayer = L.mapbox.featureLayer().addTo(map);

    //     //-----------------------JSON data for markers
    //     var geoJson = {};
    //     geoJson['type'] = 'FeatureCollection';
    //     geoJson['features'] = [];
    //     for (var k =0; k<$scope.locationAmount; k++) {
    //      var coordinate = $scope.locationCoordinates()[k];
    //         var symbol,color;
    //         symbol = "chemist";
    //         color = "#E91E63";
    //         var newFeature = {
    //             "type": "Feature",
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": coordinate
    //             },
    //             "properties": {
    //                 "title": $scope.locationNames()[k],
    //                 "metadata":k+1,
    //                 "content": message[k],
    //                 "marker-symbol": k+1,
    //                 "marker-color": color,
    //                 "marker-size": "large"

    //             }
    //         };
    //         geoJson['features'].push(newFeature);
    //     }

    //     myLayer.on('layeradd', function(e) {
    //         var marker = e.layer,
    //             feature = marker.feature;

    //         var popupContent = feature.properties.content;

    //         marker.bindPopup(popupContent,{
    //             closeButton: false,
    //             minWidth:400,
    //             maxWidth: 400,
    //             getMessageScope: function() { return $scope; }, 
    //             compileMessage:true
    //         });
    //     });
    //     myLayer.setGeoJSON(geoJson);
    // }
}]);