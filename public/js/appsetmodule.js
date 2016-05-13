
var appSetModule = angular.module("AppSetModule", []);

appSetModule.service('DataService', function(){
    DataService = {};
});

appSetModule.controller('ShareCtrl', function($scope, DataService) {
    getDeploy = function(){
        $scope.dbsuccess = false;
        var db = new PouchDB('https://myoa.smileupps.com/user');
        db.get('setting').then(function (docs) {
            // handle result
            // store deployment
            $scope.deploy = docs.deploy;
            $scope.currentClass = docs.classroom[docs.deploy.classroom];
            $scope.$apply();
            // get app based on the deploy
            var apps = new PouchDB('https://myoa.smileupps.com/myoa');
            apps.get($scope.deploy.app).then(function(doc){
                DataService.app = doc;
                $scope.dbsuccess = true;
                $scope.$apply();
            }).catch(function (err) {
                console.log(err);
            });
        }).catch(function (err) {
            console.log(err);
        }); 
    }
    $scope.chooseGroup = function (event,index){
        // $('.groupBtn').removeClass('active');
        // $(event.target).addClass('active');
        DataService._indexGroup = index;
        DataService.group = $scope.currentClass.groups[index];
    }

    getDeploy();
});

appSetModule.controller('IndividualCtrl', function($scope, DataService) {
    getDeploy = function(){
        var db = new PouchDB('https://myoa.smileupps.com/user');
        db.get('setting').then(function (docs) {
            // handle result
            // store deployment
            $scope.deploy = docs.deploy;
            $scope.currentClass = docs.classroom[docs.deploy.classroom];
            $scope.$apply();
            // get app based on the deploy
            var apps = new PouchDB('https://myoa.smileupps.com/myoa');
            apps.get($scope.deploy.app).then(function(doc){
                DataService.app = doc;
            }).catch(function (err) {
                console.log(err);
            });
        }).catch(function (err) {
            console.log(err);
        }); 
    }
    $scope.range = function(n) {
        var num = parseInt(n);
        return new Array(num);   
    }
    $scope.chooseGroup = function (event,index){
        $('.groupBtn').removeClass('active');
        $(event.target).addClass('active');
        $scope.currentGroup = $scope.currentClass.groups[index];
        DataService.group = $scope.currentGroup;
        DataService._indexGroup = index;
        $scope.showStudents = true;
    }
    $scope.choosePlayer = function(index){
        DataService._indexPlayer = index;
    }
    getDeploy();
});









