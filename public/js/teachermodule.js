var teacherModule = angular.module("TeacherModule", []);

teacherModule.service('DataService', function(){
    DataService = {};
});

teacherModule.controller('MonitorCtrl', function($scope, DataService){
  var chosenGroup = [];

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
          var markers = doc.mapstep1.markers;
          var markerNames = [];
          for(var i=0; i<markers.length; i++){
            markerNames.push(markers[i].name);
          }
          DataService.markers = markerNames;
          $scope.dbsuccess = true;
          $scope.$apply();
      }).catch(function (err) {
          console.log(err);
      });
    }).catch(function (err) {
      console.log(err);
    }); 
  }

  $scope.chooseGroup = function(event, group){
    var element = $(event.target);

    if(element.hasClass("btn-warning")){
      element.removeClass("btn-warning");
      element.addClass("btn-default");
      var num = chosenGroup.indexOf(group);
      chosenGroup.splice(num,1);
    }else{
      element.removeClass("btn-default");
      element.addClass("btn-warning");
      chosenGroup.push(group);
    }
  }

  $scope.validateGroup = function(){
    DataService.groups = $scope.currentClass.groups;
    DataService.chosenGroup = chosenGroup;
  }

  getDeploy();
})

teacherModule.controller('TeacherCtrl', function($scope,DataService){
	// var socket = io.connect('http://localhost:8000');
  var socket = io.connect('https://myoa.herokuapp.com');
  $scope.range = function(n) {
    var num = parseInt(n);
    return new Array(num);   
  }

  init = function(){
    $scope.markers = DataService.markers;
    $scope.groups = DataService.groups;
    $scope.chosenGroup = DataService.chosenGroup;
    $scope.notes = [];
    for(var i=0; i<$scope.groups.length; i++){
      var notePlayer = [];
      notePlayer.length = parseInt($scope.groups[i].studentamount);
      $scope.notes.push(notePlayer);
    }
  }

  serviceInit = function(){
    socket.on('addlocalnote', function(data){
      $scope.notes[data.group-1][data.player-1]=data.notes;
      $scope.$apply();
    });
    socket.on('deletelocalnote',function(data){
      $scope.notes[data.group-1][data.player-1]=data.notes;
      $scope.$apply();
    })
  }

  init();
  serviceInit();
});
