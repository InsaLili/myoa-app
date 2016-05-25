var teacherModule = angular.module("TeacherModule", []);

teacherModule.service('DataService', function(){
    DataService = {};
});

teacherModule.controller('TeacherCtrl', function($scope, DataService){
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
        var app={};
        var markers = doc.mapstep1.markers;
        app.markers = [];
        for(var i=0; i<markers.length; i++){
          app.markers.push(markers[i].name);
        }
        app.cris = doc.mapstep1.cris.teacher;
        // set evaluation type
        var seqtype = doc.mapstep2.seqtype;
        if(seqtype == "restricted"){
          app.evalType = doc.mapstep2.reseq.s1.eval;
          app.evalScale = doc.mapstep2.reseq.s1.scale;
        }else{
          app.evalType = "group";
          app.evalScale = doc.mapstep2.unseq.s1.scale;
        }
        DataService.app = app;
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

teacherModule.controller('MonitorCtrl', function($scope,DataService){
	var socket = io.connect('http://localhost:8000');
  // var socket = io.connect('https://myoa.herokuapp.com');
  $scope.range = function(n) {
    var num = parseInt(n);
    return new Array(num);   
  }

  init = function(){
    $scope.app = DataService.app;
    $scope.groups = DataService.groups;
    $scope.chosenGroup = DataService.chosenGroup;
    // construct notes array
    // note[group][student]
    $scope.notes = [];
    $scope.commonNotes = [];
    for(var i=0; i<$scope.groups.length; i++){
      var notePlayer = [];
      var commonnotePlayer = [];
      notePlayer.length = parseInt($scope.groups[i].studentamount);
      commonnotePlayer.length = parseInt($scope.groups[i].studentamount);
      $scope.notes.push(notePlayer);
      $scope.commonNotes.push(commonnotePlayer);
    }
    // construct evaluation array
    $scope.eval = [];
    if($scope.app.evalType=="group"){
      // eval[group][location][cri]
      for(var j=0; j<$scope.groups.length; j++){
        var evalMarker = [];
        for(var k=0;k<$scope.app.markers.length;k++){
          var evalCri=[];
          evalCri.length = $scope.app.cris.length;
          evalMarker.push(evalCri);
        }
        $scope.eval.push(evalMarker);
      }
    }else{
      // eval[group][student][location][cri]
      for(var j=0; j<$scope.groups.length; j++){
        var evalMarker = [];
        for(var k=0;k<$scope.groups[j].studentamount;k++){
          var evalStudent=[];
          for(var l=0;l<$scope.app.markers.length;l++){
            var evalCri=[];
            evalCri.length = $scope.app.cris.length;
            evalStudent.push(evalCri);
          }
          evalMarker.push(evalStudent);
        }
        $scope.eval.push(evalMarker);
      }
    }
    // contruct navigation array
    // nav[group][student][location]
    $scope.nav=[];
    for(i=0;i<$scope.groups.length;i++){
      var navPlayer=[];
      for(j=0;j<$scope.groups[i].studentamount;j++){
        var navMarker=[];
        navMarker.length = $scope.app.markers.length;
        navPlayer.push(navMarker);
      }
      $scope.nav.push(navPlayer);
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
    });
    socket.on('addcommonnote', function(data){
      $scope.commonNotes[data.group-1][data.player-1] = data.notes;
      $scope.$apply();
    });
    socket.on('deletecommonnote', function(data){
      $scope.commonNotes[data.group-1][data.player-1] = data.notes;
      $scope.$apply();
    });
    socket.on('evalonshare', function(data){
      $scope.eval[data.group-1][data.location-1][data.cri] = data.value;
      $scope.$apply();
    });
    socket.on('evaluate', function(data){
      $scope.eval[data.group-1][data.player-1][data.location-1][data.cri] = data.value;
      $scope.$apply();
    });
    socket.on('checklocation', function(data){
      console.log(data);
      ($scope.nav[data.group-1][data.player-1][data.location-1]==undefined)?($scope.nav[data.group-1][data.player-1][data.location-1])=1:($scope.nav[data.group-1][data.player-1][data.location-1]++);
      $scope.$apply();
    });
  }

  init();
  serviceInit();
});






















