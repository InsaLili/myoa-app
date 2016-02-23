
var appSetModule = angular.module("AppSetModule", []);
var mapsetting;

appSetModule.service('DataService', function(){
    var db = new PouchDB('http://localhost:5984/framework');
    var mapsetting;
    var self = this;
    self.groupnum = 0;
    self.studentAmount = 0;
    // ！！！！todo，用nodejs先在server side获取数据库数据
    db.get("mapsetting").then(function(doc) {
        self.mapsetting = doc;
    },self).catch(function(err){
        console.log(err);
    });
});

appSetModule.controller('StyleCtrl', function($scope, DataService) {
    console.log(DataService);
});
