var mapModule = angular.module("MapModule", []);

mapModule.controller('MapCtrl', function($scope, DataService){
	var mapsetting = DataService.mapsetting;
	var socket = io.connect('http://localhost:8000');
    $scope.groupamount = Number(mapsetting.groupnum);
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
        $scope.mapInit();
        
        // Server.attachNotes();
        // Server.attachRating();
    }
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

    }

    $scope.mapInit = function(){
        L.mapbox.accessToken = 'pk.eyJ1IjoiaW5zYWxpbGkiLCJhIjoickF1VzlYVSJ9.JH9ZrV76fbU5Ub9ZgBhNCw';
        var map = L.mapbox.map('map', 'insalili.meikk0a8', {
            zoomControl: false
        }).setView([$scope.laititude, $scope.longtitude], 15);
        //------------------add markers
        var message = [];
        for(var i=0; i<$scope.locationAmount; i++){
            var num = i+1;
            var name = $scope.locationNames[i];
            message[i]= '<div id="marker'+num+'"><h3>'+name+'</h3><img class= "markerImg" src="/img/place'+num+'.jpg"><button type="button" class="btn player1 markerBtn" value="'+num+',1"><img src="/img/player1.png"></button><button type="button" class="btn player2 markerBtn" value="'+num+',2"><img src="/img/player2.png"></button><button type="button" class="btn player3 markerBtn" value="'+num+',3"><img src="/img/player3.png"></button></div>';
        }

        var myLayer = L.mapbox.featureLayer().addTo(map);

        //-----------------------JSON data for markers
        var geoJson = {};
        geoJson['type'] = 'FeatureCollection';
        geoJson['features'] = [];
        for (var k =0; k<$scope.locationAmount; k++) {
        	var coordinate = $scope.locationCoordinates()[k];
            var symbol,color;
            symbol = "chemist";
            color = "#E91E63";
            var newFeature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": coordinate
                },
                "properties": {
                    "title": $scope.locationNames[k],
                    "metadata":k+1,
                    "content": message[k],
                    "marker-symbol": k+1,
                    "marker-color": color,
                    "marker-size": "large"
                }
            };
            geoJson['features'].push(newFeature);
        }

        myLayer.on('layeradd', function(e) {
            var marker = e.layer,
                feature = marker.feature;

            var popupContent = feature.properties.content;

            marker.bindPopup(popupContent,{
                closeButton: false,
                minWidth:400,
                maxWidth: 400
            });
        });
        myLayer.setGeoJSON(geoJson);
    }
    $scope.activeTouch = function(){
    	$('.location').touch();
    }
    $scope.checkLocation = function($event,marker,player){
    	console.log(marker,player);
    }    
    $scope.chooseLocation = function($event,marker){
    	console.log(marker);
    }
});
