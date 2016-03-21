
var appSetModule = angular.module("AppSetModule", []);
var mapsetting;

appSetModule.service('DataService', function(){
    var db = new PouchDB('http://localhost:5984/framework');
    var mapsetting;
    var self = this;
    self.groupNum = 0;
    self.studentNum= 0;
    self.studentAmount = 0;
    // ！！！！todo，用nodejs先在server side获取数据库数据
    db.get("mapsetting").then(function(doc) {
        self.mapsetting = doc;
    },self).catch(function(err){
        console.log(err);
    });

    db.get("mapstep1").then(function(doc) {
        self.mapstep1 = doc;
    },self).catch(function(err){
        console.log(err);
    });
    db.get("mapstep2").then(function(doc) {
        self.mapstep2 = doc;
    },self).catch(function(err){
        console.log(err);
    });
    db.get("mapstep3").then(function(doc) {
        self.mapstep3 = doc;
    },self).catch(function(err){
        console.log(err);
    });
    db.get("mapstep4").then(function(doc) {
        self.mapstep4 = doc;
    },self).catch(function(err){
        console.log(err);
    });

    db.allDocs({
        include_docs: true,
        attachements: true,
        startkey: 'note',
        endkey: 'note\uffff'
    }).then(function(note){
        console.log(note);
        self.notes = note;
    },self);

    db.allDocs({
        include_docs: true,
        attachements: true,
        startkey: 'vote',
        endkey: 'vote\uffff'
    }).then(function(vote){
        console.log(vote);
        self.votes = vote;
    },self);
});

appSetModule.controller('StyleCtrl', function($scope, DataService) {
    console.log(DataService);
});
