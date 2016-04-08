
var appSetModule = angular.module("AppSetModule", []);

appSetModule.service('DataService', function(){
    DataService = {};
});

appSetModule.controller('AppCtrl', function($scope, DataService) {
    getAppSet = function(){
        var db = new PouchDB('http://myoa.smileupps.com/myoa');
        db.allDocs({
            include_docs: true,
            attachements: true
        }).then(function (docs) {
            // handle result
            $scope.apps=[];
            for(var i=0;i<docs.rows.length;i++){
                $scope.apps.push(docs.rows[i].doc);
            }
            $scope.$apply();
            DataService.docs = $scope.apps;
        }).catch(function (err) {
            console.log(err);
        }); 
    }
    getGroupSet = function(){
        var db = new PouchDB('http://myoa.smileupps.com/user');
        db.get('groups').then(function(doc){
            $scope.groups = doc.groups;
            $scope.$apply();
            DataService.groups = doc.groups;
        });
    }
    $scope.chooseDoc = function (event,index){
        $('.appBtn').removeClass('active');
        $(event.target).addClass('active');
        DataService._indexApp = index;
    }
    $scope.chooseGroup = function (event,index){
        $('.groupBtn').removeClass('active');
        $(event.target).addClass('active');
        DataService._indexGroup = index;
    }

    getAppSet();
    getGroupSet();
});

appSetModule.controller('DeviceCtrl', function($scope, DataService){
    getGroup = function(){
        $scope.group = DataService.groups[DataService._indexGroup];
        $scope.group.student = parseInt($scope.group.student);
    }
    $scope.range = function(n) {
        return new Array(n);   
    }
    $scope.chooseDevice = function(event){
        $(event.target).addClass('active');
        $scope.personal = true;
    }
    $scope.choosePlayer = function(index){
        DataService._indexPlayer = index;
    }
    getGroup();
});











