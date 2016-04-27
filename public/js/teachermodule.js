var teacherModule = angular.module("TeacherModule", []);

teacherModule.controller('TeacherCtrl', function($scope, DataService,$timeout){
	var socket = io.connect('http://localhost:8000');
    // var socket = io.connect('https://myoa.herokuapp.com');

});
