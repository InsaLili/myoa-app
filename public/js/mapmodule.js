var mapModule = angular.module("MapModule", ["leaflet-directive"]);

mapModule.filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);

mapModule.controller('AppCtrl', function($scope, $timeout, DataService){
    // var socket = io.connect('http://localhost:8000');
    var socket = io.connect('https://myoa.herokuapp.com');

    $scope.range = function(n) {
        return new Array(n);   
    };
    //!!!!todo,delete some var
    getInfo = function(){
        // get location amount
        $scope.locationAmount = DataService.app.mapstep1.markers.length;
        // get group number
        $scope.groupNum = DataService._indexGroup+1;
        // get current group names
        $scope.groupName = DataService.group.name;
        // get students' names
        $scope.students = DataService.group.students;
        // get student amount
        $scope.studentAmount = parseInt(DataService.group.studentamount);
        // store note number
        $scope.studentNotes=[];
        // calculate avatar width based on student amount
        $scope.avatarWidth = Math.round(12/$scope.studentAmount);

        // store the number of evaluated location of each student
        $scope.evalAmount=[];
        
        // get relevant information
        $scope.infos = DataService.app.mapstep1.infos;
        // check device
        $scope.shareDis = DataService.app.mapstep4.share;
        // browsed location of each player
        $scope.browsed = [];
        for(var i=0;i<$scope.studentAmount;i++){
            var playerBrowsed = [];
            $scope.browsed.push(playerBrowsed);
        }
        // step time
        $scope.timeline = [];
        // dragged map
        $scope.drag = 0;
        $scope.zoom = 0;

    };
    getMarkers = function(){
      // get markers
        $scope.markers = DataService.app.mapstep1.markers;
        // get symbol of each location, and change lower case to upper case
        for(var i=0; i<$scope.locationAmount;i++){
            $scope.markers[i].symbol = $scope.markers[i].icon.icon;
            if(isNaN($scope.markers[i].icon.icon)){
                $scope.markers[i].symbol = $scope.markers[i].symbol.toUpperCase();
            }
        }  
    };
    getSteps = function(){
        // get the type of sequence, and set steps based on the sequence type
        $scope.seqtype = DataService.app.mapstep2.seqtype;
        if($scope.seqtype === "restricted"){
            // rebuild steps
            $scope.steps = DataService.app.mapstep2.reseq;
            if($scope.steps.s3.exist === false){
                delete $scope.steps.s3;
            }else{
                var s3=true;
            }
            if($scope.steps.s0.exist === false){
                delete $scope.steps.s0;
            }else{
                var s0=true;
            }
            // when there are four steps, change the layout of the UI
            if(s0 && s3){
                $scope.moreSteps = true;
            }
            // build an array to store chosen location
            ($scope.steps.s1.alter !== "one")?($scope.chosenNum = []):null;

        }else{
            $scope.steps = DataService.app.mapstep2.unseq;
            delete $scope.indiStu.timerValue[3];
            if($scope.steps.s2.exist === false){
                delete $scope.steps.s2;
            }

            if($scope.steps.s0.exist === false){
                delete $scope.steps.s0;
            }
            // build an array to store chosen locations
            $scope.chosenNum = []
        }
    };
    getCris = function(){
        // get criterias
        $scope.cris = DataService.app.mapstep1.cris;
        $scope.crisTea = $scope.cris.teacher.length;
        $scope.cris.num = $scope.crisTea;
    };
    getEvalConfig = function(){
        // get steps and evalate on which device
        ($scope.steps.s1.eval)?($scope.evaltype = $scope.steps.s1.eval):($scope.evaltype = "group");
        // check device
        $scope.shareDis = DataService.app.mapstep4.share;
        // judge on which device to make the evaluation
        if($scope.evaltype === "individual"){
            // caculate the needed number of evaluation in restricted/individual type
            $scope.needEvals = $scope.studentAmount * $scope.locationAmount;
            $scope.currentEval = 0;
        }else{
            // caculate the needed number of evaluation in restricted/individual type
            $scope.needEvals = $scope.locationAmount;
            $scope.currentEval = 0;
        }
        $scope.evalVal = [];
        // when there is no s0, structure evalVal
        if($scope.steps.s0 === undefined){
            $scope.cris.num = $scope.cris.teacher.length;

            // if($scope.cris.num == 0){
            //     $scope.evalVal.length = $scope.locationAmount;
            // }else{
            for(var j=0; j<$scope.locationAmount;j++){
                var cris = [];
                // if evluating individually, add the player dimention to the array
                if($scope.evaltype==="individual"){
                    // when no predefined cris, evalVal[location][0][player]
                    if($scope.cris.num === 0){
                        var crisplayer = [];
                        crisplayer.length = $scope.studentAmount;
                        cris.push(crisplayer);
                    }else{
                        // 有多个cris的时候，evalVal[location][cri][player]
                        for(var k=0;k<$scope.cris.num;k++){
                            var crisplayer = [];
                            crisplayer.length = $scope.studentAmount;
                            cris.push(crisplayer);
                        }
                    }
                }else{
                    cris.length = $scope.cris.num;
                }
                $scope.evalVal.push(cris);
            }
            // }
            // set the number of the current step, 不让学生添加cris的时候第一步为1
            $scope.currentStep = 1;
        }else{
            // 让学生添加cris的时候，第一步为0
            $scope.currentStep = 0;
        }
        // 判断什么时候可以点击公共屏幕上的星星
        ($scope.evaltype === "group" && $scope.currentStep === 1)?($scope.clickStar = true):($scope.clickStar=false);
    };
    getIncidator = function(){
        // get student indicators
        $scope.indiStu = DataService.app.mapstep3.indiStu;
        // badge的配置
        ($scope.indiStu.badge.timer)?($scope.timerWin = []):null;
        // get timer badge number
        var timerBadgeNum = function(){
            var time=0;
            for(var k=0; k<4;k++){
                if($scope.indiStu.timers[k] === true)
                    time++;
            }
            if(time>2) time = 2;
            return time;
        };

        $scope.badgeWidth = 12/timerBadgeNum();
    };
    configNote = function(){
        // store notes
        $scope.notes = [];
        // for(var i=0; i<$scope.studentAmount;i++){
        //     var pnote = [];
        //     $scope.notes.push(pnote);
        // }
        $scope.commonNotes = [];
    };
    configDB = function(){
        var db = new PouchDB('https://myoa.smileupps.com/user');
        // set DB title
        var d = new Date();
        var year = d.getYear()+1900;
        var month = d.getMonth()+1;
        var day = d.getDate();    
        var h= d.getHours();
        var m = d.getMinutes();
        var s = d.getSeconds();
        $scope.dbID = "group"+$scope.groupNum+'/'+year+'y'+month+'mo'+day+'th'+h+'h'+m+'m'+s+'s';
        db.put({
            _id: $scope.dbID
        }).catch(function(err){
            console.log(err);
        });
    };
    configMap = function(){
        $scope.map = DataService.app.mapstep1.map;
        var devicecompo = DataService.app.mapstep4.device;
        angular.extend($scope, {
            tiles: {
                name: 'MYOA',
                url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                type: 'xyz',
                options: {
                    apikey: 'pk.eyJ1IjoiaW5zYWxpbGkiLCJhIjoickF1VzlYVSJ9.JH9ZrV76fbU5Ub9ZgBhNCw',
                    mapid: 'insalili.meikk0a8'
                }
            }
        });
        for(var i=0; i<$scope.locationAmount;i++){
            var num = i+1;
            var message = '<div id="marker'+num+'" class="mapMarker"><h3>'+$scope.markers[i].name+'</h3>';
            if($scope.markers[i].photo !== undefined){
                message += '<img class="markerImg" src="'+$scope.markers[i].photo+'" />';
            }
            // when only has the large display, hide the avatar in the marker;; to be improved
            if(devicecompo === "large"){
                message += '<p class="markerInfo">'+$scope.markers[i].data+'</p>';
            }else{
                for(var j=1; j<=$scope.studentAmount;j++){
                    message += '<button type="button" class="btn player'+j+' markerBtn" ng-click="checkLocation($event,'+num+','+j+')"><img src="/img/player'+j+'.png"></button>'
                }
            }
            message += '</div>';
            $scope.markers[i].getMessageScope = function(){return $scope;};
            $scope.markers[i].message = message;
            $scope.markers[i].compileMessage = true;
            $scope.markers[i].draggable = false;

        }
        $scope.$on("leafletDirectiveMap.dragend", function(){
            // update drag number
            $scope.drag++;
            updateDB();
        });        
        $scope.$on("leafletDirectiveMap.zoomend", function(){
            // update drag number
            $scope.zoom++;
            updateDB();
        });
    };

    serviceInit = function(){
        //------following parts realize the communication between pages

        // add criteria
        socket.on('successcri', function (data){
           if(data.group !== $scope.groupNum) return;
           $scope.cris.student.push(data.cri);
           $scope.$apply();
        });
        socket.on('deletecri', function (data){
           if(data.group !== $scope.groupNum) return;
           $scope.cris.student = $.grep($scope.cris.student, function(value) {
                return value.id != data.id;
            });
           $scope.$apply();
        });
        // add comment to an alternative
        socket.on('addlocalnote', function (data) {
            if(data.group !== $scope.groupNum) return;
            
            $scope.notes.push(data.newnote);
            $scope.studentNotes[data.player-1]++;
            $scope.$apply();
            updateDB();
        });

        // delete comment from alternative
        socket.on('deletelocalnote', function (data) {
            if(data.group !== $scope.groupNum) return;
            $scope.notes = $.grep($scope.notes, function(value){
                return value.id != data.noteid;
            });
            $scope.studentNotes[data.player-1]--;
            $scope.$apply();
            updateDB();

        });

        // add comment to common space
        socket.on('addcommonnote', function (data) {
            if(data.group !== $scope.groupNum) return;

            $scope.commonNotes.push(data.newnote);
            $scope.studentNotes[data.player-1]++;
            $scope.$apply();
            updateDB();

        });
            

        // delete common comment
        socket.on('deletecommonnote', function (data) {
            if(data.group !== $scope.groupNum) return;
            $scope.commonNotes = $.grep($scope.commonNotes, function(value){
                return value.id != data.noteid;
            });
            $scope.studentNotes[data.player-1]--;
            $scope.$apply();
            updateDB();

        });

        // evaluate 
        socket.on('evaluate', function (data){
            if(data.group !== $scope.groupNum) return;

            if($scope.evaltype == 'individual'){
                $scope.evalVal[data.location-1][data.cri][data.player-1] = data.value;
                if(data.newvote == true){
                    updateProg(data);
                }
            }else{
                if($scope.evalVal[data.location-1][data.cri] == undefined){
                    $scope.evalVal[data.location-1][data.cri] = data.value;
                    ifNewLocation(data.location-1);
                }else{
                    $scope.evalVal[data.location-1][data.cri] = data.value;
                }
            }
            $scope.$apply();
            updateDB();

        });
    };

    attachNotes = function(){
        for(var i=0; i<$scope.studentAmount;i++){
            var player = i+1;
            var notes = $.grep($scope.notes, function(value) {
                return value.player == player;
            });
            var commonnotes = $.grep($scope.commonNotes, function(value) {
                return value.player == player;
            });
            var allnote = notes.length+commonnotes.length;
            $scope.studentNotes.push(allnote);
        }
        console.log("notes number");
        console.log($scope.studentNotes);
    };
    dialogInit = function(){
        var steps = $scope.steps.length;
        $( ".dialog").dialog({
            autoOpen: false,
            resizable: false,
            width:600,
            height:420,
            modal: true,
            buttons: {
                "Commencer": function(){
                    $(this).dialog( "close" );
                    // var step = Number(this.id.match(/\d/)[0])
                    timerInit($scope.currentStep);
                }
            }
        });
        $("#dialogFinal").dialog({
            autoOpen: false,
            resizable: true,
            width:600,
            height:420,
            modal: true,
            buttons: {
                "OK": function() {
                    $( this ).dialog( "close" );
                }
            }
        });
        $( "#chooseDialog").dialog({
            autoOpen: false,
            resizable: false,
            width:600,
            height:420,
            modal: true,
            buttons: {
                "Oui": function() {
                    $( this ).dialog( "close" );
                    confirmChoice();
                },
                "Non": function() {
                    $( this ).dialog( "close" );
                }
            }
        });
        $(".infoDlg").dialog({
            autoOpen: false,
            resizable: true,
            width:500,
            height:300,
            modal: false,
            buttons: {
                "OK": function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    };
    // add a new timer
    timerInit = function(step){
        if($scope.indiStu.timers[step]){
            var timerValue = $scope.indiStu.timerValue[step];
            $('#timer'+step).countdown({
                image: "/img/digits.png",
                format: "mm:ss",
                startTime: timerValue
            });
        }
    };
    updateProg = function(data){
        var location = data.location;
        var player = data.player;
        var id = data.id;
        // add player's vote progress
        isNaN($scope.evalAmount[player-1])?($scope.evalAmount[player-1]=1):($scope.evalAmount[player-1]++);
        // update progressbar
        var voteNum = $scope.evalAmount[player-1];
        var progressbarText = $('.progspace p');
        $( "#progressbar"+player ).progressbar({
            value: voteNum
        });
        $(progressbarText[player-1]).text(voteNum + '/'+$scope.locationAmount+' Emplacements');
        // update checkmark
        var checkMark = $('#location'+location+' .glyphicon-ok-circle')[player-1];
        $(checkMark).removeClass('grey');
        $(checkMark).addClass('checked');
        // update current number of evaluated locations
        $scope.currentEval++;
    };
    updateStep = function($event,index,step){
        // change the check mark
        var element = $event.target.parentElement;
        $(element.children[0]).removeClass('glyphicon-unchecked');
        $(element.children[0]).addClass('glyphicon-check');
        // change color of next task
        // if(step<$scope.steps.length){
        (element.nextElementSibling)?($(element.nextElementSibling.children).css('color', '#E0E0E0')):null;
        // $(element.nextElementSibling.children).css('color', '#E0E0E0');
        // }
        // remove the former timer if it exists
        if($('#timer'+step).length !== 0){
            clearInterval(intervals.main);
            $('#timer'+step).remove();
            if($scope.indiStu.badge.timer === true){
                if(digits[1].current != 9){
                    $scope.timerWin[step] = true;
                }else{
                    $scope.timerWin[step] = false;
                }
            }
        }
        // reset clickStar
        $scope.clickStar = false;
        // open the dialogue of next step
        var dlgIndex = index+1;
        ($('#dialog'+dlgIndex).length !== 0)?($('#dialog'+dlgIndex).dialog('open')):($('#dialogFinal').dialog('open'))
        // $('#dialog'+dlgIndex).dialog('open');
    };

    confirmChoice = function(){
        $('.chooseLocation').hide();
        $('.location').hide();

        if($scope.steps.s2 && $scope.steps.s2.alter=="one"){
            $('#location'+$scope.chosenNum).show();
        }else{
            for(var i=0; i<$scope.chosenNum.length;i++){
                $('#location'+$scope.chosenNum[i]).show();
            }
        }
    };
    // show the average of evaluation results
    getEvalAvg = function(){
        for(var i=0; i<$scope.locationAmount; i++){
            for(var j=0; j<$scope.cris.num;j++){
                var crisEval = 0;
                for(var k=0;k<$scope.studentAmount;k++){
                    crisEval += $scope.evalVal[i][j][k];
                }
                crisEval = Math.round(crisEval/$scope.studentAmount);
                $scope.evalVal[i][j] = crisEval;
            }
        }
    };

    // check if finished evaluation of a location
    ifNewLocation = function(locationNum){
        var neweval = true;
        for(var i=0; i<$scope.cris.num;i++){
            if($scope.evalVal[locationNum][i] == undefined){
                neweval = false;
                break;
            }
        }
        if(neweval == true){
            $scope.currentEval++;
            $( "#progressGroup" ).progressbar({
                value: $scope.currentEval
            });
            $("#groupProgTxt").text($scope.currentEval + '/'+$scope.locationAmount+' Emplacements');
        }
    };
    updateDB = function(){
        var db = new PouchDB('https://myoa.smileupps.com/user');
        db.get($scope.dbID).then(function(doc){
            return db.put({
                notes: $scope.notes,
                commonnotes: $scope.commonNotes,
                eval: $scope.evalVal,
                browsed: $scope.browsed,
                drag: $scope.drag,
                zoom: $scope.zoom,
                timeline: $scope.timeline
            }, $scope.dbID, doc._rev);
        });
    };

    $scope.getInfo = function(num){
        $('#infoDlg'+num).dialog('open');
    };
    // nextStep
    $scope.nextStep = function($event, index){
        // skip step 0 when there is no s0
        var step;
        ($scope.steps.s0==undefined)?(step = index+1):(step = index);

        if(step == $scope.currentStep){
            switch (step){
                // to step 1; prepare the array for store vote value
                case 0:
                    updateStep($event,index,step);
                    // make stars clickable when students are allowed to evaluate on the shared display
                    ($scope.evaltype == "group")?($scope.clickStar = true):null;
                    // get the length of the current criteria
                    $scope.cris.num = $scope.cris.teacher.length+$scope.cris.student.length;
                    for(var j=0; j<$scope.locationAmount;j++){
                        var cris = [];
                        // if evluating individually, add the player dimention to the array
                        if($scope.evaltype=="individual"){
                            for(var k=0;k<$scope.cris.num;k++){
                                var crisplayer = [];
                                crisplayer.length = $scope.studentAmount;
                                cris.push(crisplayer);
                            }
                        }else{
                            cris.length = $scope.cris.num;
                        }
                        $scope.evalVal.push(cris);
                    }
                    ($scope.seqtype == "unrestricted")?($(".chooseLocation").show()):null;
                    break;
                case 1:
                    // in a restricted sequence, can only move to step2 when students evaluated all the locations
                    if($scope.seqtype == "restricted" && $scope.currentEval !== $scope.needEvals) return;
                    
                    if($scope.evaltype == "individual") getEvalAvg();

                    ($scope.seqtype == "unrestricted")?(confirmChoice()):($(".chooseLocation").show());

                    updateStep($event,index,step);
                    break;
                case 2:
                    ($scope.seqtype == "restricted")?confirmChoice():null;
                    updateStep($event,index,step);
                    break;
                case 3:
                    updateStep($event,index,step);
                    break;
            }
            
            $scope.currentStep++;
            socket.emit("changestep", {group: $scope.groupNum, step:$scope.currentStep});

            // update timeline
            var d = new Date();
            var h= d.getHours();
            var m = d.getMinutes();
            var s = d.getSeconds();
            var timeline = h+'h'+m+'m'+s+'s';
            $scope.timeline.push(timeline);
            updateDB();
        }
    }

    // submit evaluation of one location
    $scope.changeEval = function(locationNum,criNum,value){
        if($scope.evalVal[locationNum][criNum] == undefined){
            $scope.evalVal[locationNum][criNum] = value;
            ifNewLocation(locationNum);
        }else{
            $scope.evalVal[locationNum][criNum] = value;
        }
        var location = locationNum+1;
        socket.emit('evalonshare', {group: $scope.groupNum, location: location, cri: criNum, value: value});
    }
    $scope.checkLocation = function($event,marker,player){
    	console.log(marker,player);
        // in s0, cris.num always equal to 0, so vote=[]
        var vote = [];
        if($scope.currentStep !== 0){
            for(var i=0; i<$scope.cris.num;i++){
                var value;
                ($scope.evaltype == "individual")?(value=$scope.evalVal[marker-1][i][player-1]):(value=$scope.evalVal[marker-1][i])
                vote.push(value);
            }
        }
        var notes = $.grep($scope.notes, function(value){
            return value.player == player;
        }); 
        var commonNotes = $.grep($scope.commonNotes, function(value){
            return value.player == player;
        }); 

        socket.emit('checklocation', { location: marker, player: player, group: $scope.groupNum, vote: vote, note: notes, commonnote: commonNotes});

        var element = $event.currentTarget;
        var className = element.className;
        var elements = document.getElementsByClassName(className);
        $(elements).css({'background-color': '#5bc0de', 'border-color': '#46b8da'});
        $(element).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
        $($(elements)[marker-1]).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
        // update browsed number
        ($scope.browsed[player-1][marker-1]==undefined)?($scope.browsed[player-1][marker-1]=1):($scope.browsed[player-1][marker-1]++);
        updateDB();
    }    
    $scope.chooseLocation = function(event, marker,name){
    	console.log(marker,name);
        var element = $(event.target);
        if($scope.seqtype == "restricted" && $scope.steps.s2.alter == "one"){
            $('.choisirBtn').removeClass("btn-warning");
            $('.choisirBtn').text("Choisir");
            element.addClass("btn-warning");
            element.text("Choisi");
            $scope.chosenNum = marker;
            // $('#chooseDialog').dialog('open');
        }else{
            if(element.hasClass("btn-warning")){
                element.removeClass("btn-warning");
                element.addClass("btn-default");
                element.text("Choisir");
                var num = $scope.chosenNum.indexOf(marker);
                $scope.chosenNum.splice(num,1);
            }else{
                element.removeClass("btn-default");
                element.addClass("btn-warning");
                element.text("Choisi");
                $scope.chosenNum.push(marker);
            }
        }
    };
    init = function(){
        // get data and initialize service
        getInfo();
        getMarkers();
        getSteps();
        getCris();
        getEvalConfig();
        getIncidator();
        configNote();
        configDB();
        configMap();
        serviceInit();
        attachNotes();

    };
    // wait for dom ready
    $timeout(function(){
        // initiate progress bar
        if($scope.seqtype == "restricted"){
            // init progress bar
            if($scope.evaltype == "individual"){
                for(var i=0; i<$scope.studentAmount;i++){
                    var num = i+1;
                    $( "#progressbar"+num ).progressbar({
                        max: $scope.locationAmount
                    });
                }
            }else{
                $( "#progressGroup" ).progressbar({
                    max: $scope.locationAmount
                });
            }
        }
        // Change position of location cards
        var elements = $('.location');
        elements.touch();
        for(var i=0; i<elements.length;i++){
            var left = 100*i+50;
            $(elements[i]).offset({top: 250, left: left});
        }
        $('#commonSpace').touch();
        $("#step0 p").css('color', '#E0E0E0');
        $("#step0 span").css('color', '#E0E0E0');
        $(".chooseLocation").hide();

        dialogInit();
        $('#dialog0').dialog('open');

    });

    init();
});
