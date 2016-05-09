var teacherModule = angular.module("TeacherModule", []);

teacherModule.controller('TeacherCtrl', function($scope,$timeout){
	var socket = io.connect('http://localhost:8000');
	$scope.range = function(n) {
		var num = parseInt(n);
    return new Array(num);   
  }
  // var socket = io.connect('https://myoa.herokuapp.com');

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
          $scope.markers = doc.mapstep1.markers;
          $scope.$apply();
      }).catch(function (err) {
          console.log(err);
      });
    }).catch(function (err) {
      console.log(err);
    }); 
  }

  getDeploy();

});
