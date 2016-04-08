
var mapSetModule = angular.module("ToolSetModule", ["leaflet-directive"]);

mapSetModule.service('DataService', function(){
    DataService={};
});

mapSetModule.controller('ToolCtrl', [ "$scope", "DataService", function($scope, DataService) {
    getDoc = function(){
        // if it's the first time to visit the page, get docs from db
        if(DataService.docs == undefined){
            var db = new PouchDB('https://myoa.smileupps.com/myoa');
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
        // if not, get docs from DataService
        }else{
            $scope.apps = DataService.docs;
        }
    }

    $scope.deleteDoc = function (app,index){
        // confirm dialog to delete a doc
        var txt = 'Do you want to delete the "'+ app._id + '" activity?';
        if (confirm(txt) == false) return;
        // delete doc both from docs and apps
        $scope.apps.splice(index,1);
        // get id of the doc, the delete it
        var db = new PouchDB('https://myoa.smileupps.com/myoa');
        var id = app._id;
        db.get(id).then(function(doc) {
          return db.remove(doc);
        });
    }
    // edit an existing doc
    $scope.editDoc = function (index){
        // get index of the doc
        DataService._index = index; 
        // say it's an old doc; in order to get and put into db
        DataService.docType = "old";
    }
    // create a new doc based on existing docs
    $scope.replicateDoc = function (index){
        var db = new PouchDB('https://myoa.smileupps.com/myoa');
        // clone the template doc to a new doc
        var cloneDoc = jQuery.extend({}, DataService.docs[index]);
        // get the name of the new doc
        cloneDoc._id = $scope.docName;
        // get rid of the former _rev; in order to store a new doc into db
        delete cloneDoc._rev;
        // get the index of the new doc
        DataService._index = DataService.docs.length;
        // push the new doc to the docs array
        DataService.docs.push(cloneDoc);
        // store into db
        db.put(cloneDoc);
    }
    // create a totally new doc
    $scope.createDoc = function (){
        var db = new PouchDB('https://myoa.smileupps.com/myoa');
        // the template of a new doc
        var newDoc = {
            _id: $scope.docName,
            mapstep1:{
                "cris":{
                        "student":[],
                        "teacher":[]
                },
                "infos":[],
                "map":{
                    "lat":45.39525568555789,
                    "lng":2.39501953125,
                    "zoom":5
                },
                "markers":[]
            },
            mapstep2:{
                "reseq": {
                    "s0": {
                        "exist":false,
                        "title":"Define your criteria",
                        "dlg": "In this step, you need to learn what kind of decision you need to make. Define your criteria based on the context to evaluate alternatives."
                    },
                    "s1": {
                        "title": "Analysez et évaluez chaque emplacement",
                        "dlg": "Vous devez observer, analyser, et évaluer de façon individuelle les données  collectés.\nChoisissez 1 lieu et visualisez les informations."
                    },
                    "s2": {
                        "title": "Choisissez une emplacement",
                        "dlg": "Choisissez l'emplacement le plus pertinent pour votre nurserie."
                    },
                    "s3": {
                        "exist":false,
                        "title": "Construisez votre argumentaire",
                        "dlg":"En utilisant vos tablettes, justifiez votre choix en quelques lignes dans la case argumentaire.\nPensez à l'énergie, les conditions climatiques, etc."
                    }
                },
                "seqtype": null,
                "unseq": {
                    "s0": {
                        "exist":false,
                        "title":"Define your criteria",
                        "dlg": "In this step, you need to learn what kind of decision you need to make. Define your criteria based on the context to evaluate alternatives."
                    },
                    "s1": {
                        "title":"Analysez, évaluez et choisissez chaque emplacement",
                        "dlg": "Vous devez observer, analyser, et évaluer de façon individuelle les données collectés. Choisissez l'emplacement le plus pertinent pour votre nurserie."
                    },
                    "s2": {
                        "exist":false,
                        "title": "Construisez votre argumentaire",
                        "dlg":"En utilisant vos tablettes, justifiez votre choix en quelques lignes dans la case argumentaire.\nPensez à l'énergie, les conditions climatiques, etc."
                    }
                }
            },
            mapstep3:{
                "indiStu": {
                    "timers": [],
                    "timerValue": [],
                    "comment": null,
                    "badge":{
                        "timer":null,
                        "comment":null
                    }
                },
                "indiTea": {
                    "browsed":null,
                    "progre":null,
                    "comment":null
                },
                "step": []
            },
            mapstep4:{
                "person":{
                    "type": null,
                    "browse": null,
                    "comment": null,
                    "argu": null,
                    "mark": null,
                    "eval": null,
                    "progress": null,
                    "timer": null
                    },
                "share":{
                    "type": null,
                    "browse": null,
                    "progress": null,
                    "timer": null,
                    "commonspace": null,
                    "eval": null,
                    "mark": null
                }
            }
        };
        // index of new doc
        DataService._index = DataService.docs.length;
        // push doc into docs
        DataService.docs.push(newDoc);
        // store into db
        db.put(newDoc);
    }
    getDoc();
}]);

mapSetModule.controller('GroupCtrl', [ "$scope", "DataService",function($scope, DataService) {
    getGroup = function(){
        if(DataService.groups == undefined){
            var db = new PouchDB('https://myoa.smileupps.com/user');
            db.get('groups').then(function(doc){
                $scope.groups=[];
                $scope.groups = doc.groups;
                $scope.$apply();
                DataService.groups = doc.groups;
            });
        }else{
            $scope.groups = DataService.groups;
        }
    }

    $scope.addItem = function(items){
        items.push({});
    }
    $scope.deleteItem = function(item,items){
        var index = items.indexOf(item);
        items.splice(index,1);
        console.log("delete");
    }    // delete a doc

    $scope.submit = function (){
        var db = new PouchDB('https://myoa.smileupps.com/user');
        var groups = $scope.groups;
        db.get('groups').then(function(doc){
            return db.put({
                groups: groups,
            }, 'groups', doc._rev);
        })
    }
    getGroup();
}]);

mapSetModule.controller('CtrlStep1', [ "$scope", "DataService",function($scope, DataService) {
    var _index = DataService._index;
    $scope.mapstep1 = DataService.docs[_index].mapstep1;
    angular.extend($scope,{
        tiles: {
            name: 'Map',
            url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
            type: 'xyz',
            options: {
                apikey: 'pk.eyJ1IjoiaW5zYWxpbGkiLCJhIjoickF1VzlYVSJ9.JH9ZrV76fbU5Ub9ZgBhNCw',
                mapid: 'insalili.meikk0a8'
            }
        },
        // markers: $scope.mapstep1.markers,
        events: {
            mapstep1:{
                markers:{
                    enable:['dragend']
                }
            }
        }
    });

    // UPDATE coordinates
    $scope.$on("leafletDirectiveMarker.dragend", function(event, args){
        var index = parseInt(args.modelName);
        $scope.mapstep1.markers[index].lat = args.model.lat;
        $scope.mapstep1.markers[index].lng = args.model.lng;
    });

    $scope.deleteItem = function($event,item,items){
        var index = items.indexOf(item);
        items.splice(index,1);
        console.log("delete");
    }
    $scope.addMarker = function(){
        $scope.newMarker={};
        $scope.newMarker.draggable = true;
        $scope.newMarker.lat = $scope.mapstep1.map.lat;
        $scope.newMarker.lng = $scope.mapstep1.map.lng;

        $scope.newMarker.icon={};
        $scope.newMarker.icon.type = "makiMarker";
        $scope.newMarker.icon.color = "#E91E63";
        $scope.newMarker.icon.size = "l";

        $scope.mapstep1.markers.push($scope.newMarker);
    }
    $scope.addCri = function(){
        $scope.mapstep1.cris.teacher.push($scope.newCri);
        $scope.newCri = {};
    }    
    $scope.addInfo = function(){
        $scope.mapstep1.infos.push($scope.newInfo);
        $scope.newInfo = {};
    }

    // store marker picture to database
    $scope.handleMarkerFiles = function(element){
        var file = element.files[0];
        var index = angular.element(element).scope().$index;
        // if no file is chosen, set photo value to undefined
        if(file == undefined){
            $scope.mapstep1.markers[index].photo = undefined;
            return;
        }
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                $scope.mapstep1.markers[index].photo = e.target.result;
            };
        })(file);
        reader.readAsDataURL(file);
    }
    // store info picture to database
    $scope.handleInfoFiles = function(element){
        var file = element.files[0];
        var index = angular.element(element).scope().$index;
        // if no file is chosen, set photo value to undefined
        if(file == undefined){
            $scope.mapstep1.infos[index].photo = undefined;
            return;
        }
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                $scope.mapstep1.infos[index].photo = e.target.result;
            };
        })(file);
        reader.readAsDataURL(file);
    }

    $scope.toStep2 = function(){
        DataService.docs[_index].mapstep1 = $scope.mapstep1;
    }
}]);

mapSetModule.controller('CtrlStep2', [ "$scope", "DataService",function($scope, DataService) {
    var _index = DataService._index;
    $scope.mapstep2 = DataService.docs[_index].mapstep2;

    $scope.changeStep = function(){
        DataService.docs[_index].mapstep2 = $scope.mapstep2;
    }
}]);

mapSetModule.controller('CtrlStep3', [ "$scope", "DataService",function($scope, DataService) {
    var _index = DataService._index;
    $scope.mapstep3 = DataService.docs[_index].mapstep3;

    // set the comment badge check marker
    ($scope.mapstep3.indiStu.badge.comment)?($scope.commentbadge = true):($scope.commentbadge = false);

    // check the sequence and which steps we have
    if(DataService.docs[_index].mapstep2.seqtype == "restricted"){
        $scope.steps = DataService.docs[_index].mapstep2.reseq;
        $scope.probar = $scope.steps.s1.eval;
        ($scope.steps.s0.exist)?($scope.mapstep3.step[0] = true):($scope.mapstep3.step[0] = false);
        $scope.mapstep3.step[1] = true;
        $scope.mapstep3.step[2] = true;
        ($scope.steps.s3.exist)?($scope.mapstep3.step[3] = true):($scope.mapstep3.step[3] = false);
    }else{
        $scope.steps = DataService.docs[_index].mapstep2.unseq;
        ($scope.steps.s0.exist)?($scope.mapstep3.step[0] = true):($scope.mapstep3.step[0] = false);
        $scope.mapstep3.step[1] = true;
        ($scope.steps.s2.exist)?($scope.mapstep3.step[2] = true):($scope.mapstep3.step[2] = false);
        $scope.mapstep3.step[3] = false;
    }

    $scope.range = function(n) {
        return new Array(n);   
    }
    $scope.changeStep = function(){
        for(var i=0;i<$scope.mapstep3.step.length;i++){
            $scope.mapstep3.indiStu.timers[i] = $scope.mapstep3.step[i] && $scope.mapstep3.indiStu.timers[i];
        }
        ($scope.commentbadge)?$scope.mapstep3.indiStu.badge.comment:($scope.mapstep3.indiStu.badge.comment = undefined);

        DataService.docs[_index].mapstep3 = $scope.mapstep3;
    }
}]);

mapSetModule.controller('CtrlStep4', [ "$scope", "DataService",function($scope, DataService) {
    var _index = DataService._index;
    $scope.mapstep4 = DataService.docs[_index].mapstep4;
    $scope.seqtype = DataService.docs[_index].mapstep2.seqtype;
    ($scope.seqtype == "restricted")?($scope.evaltype = DataService.docs[_index].mapstep2.reseq.s1.eval):($scope.evaltype = undefined);

    $scope.changeStep = function(){
        DataService.docs[_index].mapstep4 = $scope.mapstep4;
    }

    $scope.submit = function(){
        $scope.changeStep();

        var db = new PouchDB('https://myoa.smileupps.com/myoa');
        var id = DataService.docs[_index]._id;

        // if(DataService.docType == "new"){
            // db.put(DataService.docs[_index]);
            // DataService.docs.push(DataService.doc);
        // }else{
        db.get(id).then(function(doc) {
            console.log(doc._rev);
          return db.put({
            mapstep1: DataService.docs[_index].mapstep1,
            mapstep2: DataService.docs[_index].mapstep2,
            mapstep3: DataService.docs[_index].mapstep3,
            mapstep4: DataService.docs[_index].mapstep4
          }, id, doc._rev);
        }).then(function(response) {
          // handle response
        }).catch(function (err) {
          console.log(err);
        });
        // }
    }
}]);

