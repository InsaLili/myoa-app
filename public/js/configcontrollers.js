
var mapSetModule = angular.module("MapSetModule", []);
var db = new PouchDB('http://localhost:5984/framework');
var mapsetting;

mapSetModule.controller('AppSetCtrl', function($scope, $http, $state, $stateParams) {
    
    db.get("mapsetting").then(function(doc) {
        mapsetting = doc;
        console.log(mapsetting);

        $scope.appstyle = "map";
        $scope.studentnum = mapsetting.studentnum;
        $scope.groupnum = mapsetting.groupnum;

        $scope.appSet = function(){
            mapsetting.studentnum = $scope.studentnum;
            mapsetting.groupnum = $scope.groupnum;
        }

    }).catch(function(err){
        console.log(err);
    });
});

mapSetModule.controller('MapSetCtrl', function($scope, $http, $state, $stateParams) {
    $scope.markers = mapsetting.markers;
    $scope.longtitude = mapsetting.longtitude;
    $scope.laititude = mapsetting.laititude;

    $scope.deleteMarker = function($event,marker){
        var index = $scope.markers.indexOf(marker);
        $scope.markers.splice(index,1);
        console.log("delete");
    }
    
    $scope.addMarker = function(){
        $scope.markers.push($scope.add);
        $scope.add = undefined;
    }

    $scope.setMap = function(){
        mapsetting.longtitude = $scope.longtitude;
        mapsetting.laititude = $scope.laititude;
        mapsetting.eval = $scope.eval;
        mapsetting.markers = $scope.markers;
        console.log(mapsetting);

        db.get('mapsetting').then(function(doc) {
          return db.put({
            _id: 'mapsetting',
            _rev: doc._rev,
            eval: mapsetting.eval,
            laititude: mapsetting.laititude,
            longtitude: mapsetting.longtitude,
            markers: mapsetting.markers,
            studentnum: mapsetting.studentnum,
            groupnum: mapsetting.groupnum
          });
        }).then(function(response) {
          // handle response
        }).catch(function (err) {
          console.log(err);
        });
    }
});
