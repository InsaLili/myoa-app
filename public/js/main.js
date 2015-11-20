/**
 * Created by Lili on 08/04/15.
 */

// DOM Ready =============================================================
$(document).ready(function() {
    $(document).on('contextmenu', function() {
        return false;
    });
    var db = new PouchDB('http://localhost:5984/insect');
    var socket = io.connect('http://localhost:8000');

    var groupNumber = 0;
    var allRating = 0;
    var chosenNumber = 0;
    var aguFlag = false;
    var stepNumber = 1;
    var white= '#E0E0E0';

    var locationNames=[
        '1. Balcon sur la cascade',
        '2. Sous les embruns',
        '3. Au détour du sentier',
        '4. La clairière'
    ];
    var locationCoordinates = [
        [5.892298,45.395142],
        [5.891826,45.391789],
        [5.888789,45.394547],
        [5.890012,45.398352]
    ];
    var locationAmount = locationNames.length;

    var Server={
        init: function(){
            Server.domInit();
            Server.dialogInit();
            Server.serviceInit();
        },

        domInit: function(){
            for(var i=0; i<locationAmount; i++){
                var name = locationNames[i];
                var num = i+1;
                var leftOffset = i*90+100;
                var topOffset = 200;
                $('.locations').append('<div class="location" id="location'+num+'"></div>');
                var $currentLocation = $('#location'+num);

                var title = '<div class="locationTitle"><h3>'+name+'</h3></div>';

//                var visual = '<div class="visualPlayers"  id="visualLocation'+num+'"><h4>Visualisation :</h4><div class="visualPlayer visualPlayer1"><img src="img/player1.png"></div><div class="visualPlayer visualPlayer2"><img src="img/player2.png"></div><div class="visualPlayer visualPlayer3"><img src="img/player3.png"></div></div>';
                var visual = '<div class="visualPlayers"  id="visualLocation'+num+'"><h4>Visualisation :</h4><button type="button" class="btn player1 markerBtn" value="'+num+',1"><img src="/img/player1.png"></button><span class="check1 glyphicon glyphicon-ok-circle grey"></span><button type="button" class="btn player2 markerBtn" value="'+num+',2"><img src="/img/player2.png"></button><span class="check1 glyphicon glyphicon-ok-circle grey"></span><button type="button" class="btn player3 markerBtn" value="'+num+',3"><img src="/img/player3.png"></button><span class="check1 glyphicon glyphicon-ok-circle grey"></span></div>';

                var check = '<div></div>'

                var choose = '<div class="chooseLocation"><button class="btn btn-default btn-md submitChoice" name="'+name+'" value='+num+'>Choisir cet<br/>emplacement</button></div>';
                var vote = '<div class="vote" id="vote'+num+'"><h4>Évaluation :</h4><span class="glyphicon glyphicon-star grey"></span><span class="glyphicon glyphicon-star grey"></span><span class="glyphicon glyphicon-star grey"></span><span class="glyphicon glyphicon-star grey"></span><span class="glyphicon glyphicon-star grey"></span><span class="label label-default caption">Pas Encore Évalué</span></div>';
                var note = '<div class="note"><h4>Notes :</h4><span id="note'+num+'"></span></div>';
                var content = '<div class="locationContent">'+visual+choose+vote+note+'</div>';

                $currentLocation.append(title);
                $currentLocation.append(content);
                $currentLocation.offset({top: topOffset, left:leftOffset});
            }

            //------------------initialize progress bar;
            $( "#progressbar1" ).progressbar({
                max: 4
            });
            $( "#progressbar2" ).progressbar({
                max: 4
            });
            $( "#progressbar3" ).progressbar({
                max: 4
            });
            $( ".progressbar" ).on( "progressbarcomplete", function( event, ui ) {
                allRating++;
            });

            //-------------------set tasks' buttons and color
//            $('#toStep2').prop('disabled', true);
            $('#finalStepBtn').on('click',function(){
                $(this).prop('disabled', true);
                $('#finalDialog').dialog('open');
            });
            $('#finalStepBtn').prop('disabled', true);
//            $('#resetLocationBtn').on('click', Server.resetLocation);
            $('body').off('click').on('click', '.markerBtn', function(){
                Server.chooseLocation(this);
            });
            $('#step1 p').css('color', white);
            $('#step1 span').css('color', white);


            //------------------Enable multi-touch of location cards
            // ------------------Hide school location cards at first
            // ------------------Set initial position of each card
            $('.location').touch();
            $('#insectImg').touch();
            $('#energyImg').touch();
            $('.schoolLocations').hide();
            $('.chooseLocation').hide();
            $('.visualPlayer').hide();

            //--------------bind event to buttons
            $('.chooseGroupBtn').on('click', function(){
                $('#appLayer').show();
                $('#maskLayer').hide();
                groupNumber = parseInt($(this).val());
                socket.emit('choosegroup', { group: groupNumber});
                //--------------------initialize map
                Server.mapInit();
                Server.attachNotes();
                Server.attachRating();

            });
            $('#appLayer').hide();

            // check first step
            $('#step1 span').on('click', function(){
                if(stepNumber==1){
                    // reset timer
                    clearInterval(intervals.main);
                    $('#timer1').remove();

                    // check whether win a timer badget
                    if(digits[1].current != 9){
                        $('#secondStepDialog').dialog('open');
                        $('#timerBadge img').show();
                    }else{
                        $('#secondStepDialog_noBadge').dialog('open');
                    }

                    //change checkbox
                    $(this).removeClass('glyphicon-unchecked');
                    $(this).addClass('glyphicon-check');

                    //change next step color
                    $('#step2 .glyphicon').css('color', white);
                    $('#step2 p').css('color', white);
                    stepNumber++;
                }
            });

            // second step, choose a location
            $('.submitChoice').on('click', function(){
                chosenNumber = parseInt($(this).val());
                var locationName = $(this).attr("name");
                $('#choiceConfirm h4').text("Voulez vous choisir l'emplacement '"+locationName+"' ?");
                $( "#choiceConfirm" ).dialog( "open");
            });

        },
        mapInit: function(){
            L.mapbox.accessToken = 'pk.eyJ1IjoiaW5zYWxpbGkiLCJhIjoickF1VzlYVSJ9.JH9ZrV76fbU5Ub9ZgBhNCw';
            var map = L.mapbox.map('map', 'insalili.meikk0a8', {
                zoomControl: false
            }).setView([45.394547, 5.890489], 15);
            //------------------add markers
            var message = [];
            for(var i=0; i<locationAmount; i++){
                var num = i+1;
                var name = locationNames[i];
                message[i]= '<div id="marker'+num+'"><h3>'+name+'</h3><img class= "markerImg" src="/img/place'+num+'.jpg"><button type="button" class="btn player1 markerBtn" value="'+num+',1"><img src="/img/player1.png"></button><button type="button" class="btn player2 markerBtn" value="'+num+',2"><img src="/img/player2.png"></button><button type="button" class="btn player3 markerBtn" value="'+num+',3"><img src="/img/player3.png"></button></div>';
            }

            var myLayer = L.mapbox.featureLayer().addTo(map);

            //-----------------------JSON data for markers
            var geoJson = {};
            geoJson['type'] = 'FeatureCollection';
            geoJson['features'] = [];
            for (var k =0; k<locationAmount; k++) {
                var symbol,color;
                symbol = "chemist";
                color = "#E91E63";
                var newFeature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": locationCoordinates[k]
                    },
                    "properties": {
                        "title": locationNames[k],
                        "metadata":k+1,
                        "content": message[k],
                        "marker-symbol": k+1,
                        "marker-color": color,
                        "marker-size": "large"
                    }
                };
                geoJson['features'].push(newFeature);
            }

            myLayer.on('layeradd', function(e) {
                var marker = e.layer,
                    feature = marker.feature;

                var popupContent = feature.properties.content;

                marker.bindPopup(popupContent,{
                    closeButton: false,
                    minWidth:400,
                    maxWidth: 400
                });
            });

//----------------Add features to the map.
            myLayer.setGeoJSON(geoJson);

        },
        dialogInit: function(){
            //-------------------set insect information dialog
            var insectShow = false, energyShow = false;
            $('#insectBtn').on('click', function(){
                if(insectShow == false){
                    $('#insectImg').show();
                    insectShow = true;
                }else{
                    $('#insectImg').hide();
                    insectShow = false;
                }
            });
            $('#energyBtn').on('click', function(){
                if(energyShow == false){
                    $('#energyImg').show();
                    energyShow = true;
                }else{
                    $('#energyImg').hide();
                    energyShow = false;
                }
            });

            $('.badges img').hide();
            $('#insectImg').hide();
            $('#energyImg').hide();

            //------------------Initialize each dialog
            $( "#start" ).dialog({
                resizable: false,
                width:600,
                height:420,
                modal: true,
                buttons: {
                    "Commencer": function() {
                        $( this ).dialog( "close" );
                        //-------------------set the counter
                        $('#timer1').countdown({
                            image: "/img/digits.png",
                            format: "mm:ss",
                            startTime: "08:00"
                        });
                    }
                }
            });
            $('#insectDialog').dialog({
                autoOpen: false,
                width: 820,
                height:800,
                buttons:{
                    "OK": function(){
                        $(this).dialog("close");
                    }
                }
            });

            $('#secondStepDialog').dialog({
                autoOpen: false,
                resizable: false,
                width:600,
                height:350,
                modal: true,
                buttons: {
                    "Commencer": function() {
                        $( this ).dialog( "close" );
                        Server.secondStep();
                    }
                }
            });
            $('#secondStepDialog_noBadge').dialog({
                autoOpen: false,
                resizable: false,
                width:600,
                height:350,
                modal: true,
                buttons: {
                    "Commencer": function() {
                        $( this ).dialog( "close" );
                        secondStep();
                    }
                }
            });
            $( "#choiceConfirm" ).dialog({
                autoOpen: false,
                width:500,
                height:200,
                modal: true,
                buttons: {
                    "Oui": function() {
                        $( this ).dialog( "close" );

                        Server.confirmChoice(map);
                    },
                    "Non": function() {
                        $( this ).dialog( "close" );
                    }
                }
            });
            $( '#finalDialog' ).dialog({
                autoOpen: false,
                resizable: false,
                width: 400,
                height: 200,
                buttons:{
                    "OK": function(){
                        $(this).dialog("close");
                    }
                }
            });
            $( "#gameEnd" ).dialog({
                autoOpen: false,
                width:600,
                height:300,
                modal: true,
                buttons: {
                    "Commencer": function() {
                        $( this ).dialog( "close" );
                        $('#timer3').countdown({
                            image: "/img/digits.png",
                            format: "mm:ss",
                            startTime: "07:00"
                        });
                    }
                }
            });
        },
        serviceInit: function(){
            //------following parts realize the communication between pages
            socket.on('addnote', function (data) {
                console.log(data);
                var id = data.id;
                var content = data.content;
                var player = data.player;
                var location = data.location;
                var notes = data.notes;
                $('#note'+location).append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                var noteHeight = $('#location'+location+' .note').height();
                if(noteHeight+260 > 400){
                    $('#location'+location).height(noteHeight + 260 +'px');
                }else{
                    $('#location'+location).height(400+'px');
                }

            });

            socket.on('addagu', function (data) {
                console.log(data);
                var id = data.id;
                var content = data.content;
                var player = data.player;
                var location = parseInt(data.location);
                //    var location = data.location;
                $('.arguments span').append('<p id='+id+' class="aguPlayer'+player+'">'+content+'</p>');
                var noteHeight = $('#location'+location+' .note').height();
                var aguHeight = $('#location'+location+' .arguments').height();
                if(aguHeight > 130){
                    $('#location'+location).height(noteHeight + aguHeight + 270 +'px');
                }else{
                    $('#location'+location).height(noteHeight+400+'px');
                }
            });


            socket.on('deletenote', function (data) {
                console.log(data);
                var id = data.id;
                $('#'+id).remove();
                var location = data.location;
                var player = data.player;
                var notes = data.notes;
                var noteHeight = $('#location'+location+' .note').height();
                if(noteHeight+260 > 400){
                    $('#location'+location).height(noteHeight + 260 +'px');
                }else{
                    $('#location'+location).height(400+'px');
                }
            });

            socket.on('deleteagu', function (data) {
                console.log(data);
                var id = data.id;
                $('#'+id).remove();
                var location = data.location;
                var player = data.player;
                var noteHeight = $('#location'+location+' .note').height();
                var aguHeight = $('#location'+location+' .arguments').height();
                if(aguHeight > 130){
                    $('#location'+location).height(noteHeight + aguHeight + 270 +'px');
                }else{
                    $('#location'+location).height(noteHeight+400+'px');
                }
            });

            socket.on('vote', function(data){
                var location = data.location;
                var player = data.player;
                var id = data.id;
                var rating = 0;
                var progressbar;
                // change check mark
                var checkMark = $('#location'+location+' span')[player-1];
                $(checkMark).removeClass('grey');
                $(checkMark).addClass('star-best');

                // change progressbar
                db.get(id).then(function(doc) {
                    if(doc.flag <= 1) {
                        progressbar = $('#progressbar' + player);
                        rating = parseInt(progressbar.attr("aria-valuenow"));
                        rating++;
                        progressbar.progressbar({
                            value: rating
                        });
                        progressbar.next().text(rating + '/4 Emplacements');
                    }
                }).catch(function(err){
                    console.log(err);
                });

                if(allRating == 3){
                    $('#toStep2').removeAttr('disabled');
                }
            });
        },
        //-----------------Add notes to location card
        attachNotes: function(){
            $('.location p').remove();
            var startKey = 'note_'+groupNumber;
            db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: startKey+'_1',
                endkey: startKey+'_4\uffff'
            }).then(function(locationData){
                var notes = [0,0,0]
                for(var i = 0; i < locationData.rows.length; i++){
                    var location = locationData.rows[i].doc.location;
                    var player = locationData.rows[i].doc.author;
                    var content = locationData.rows[i].doc.content;
                    var id = locationData.rows[i].doc._id;
                    notes[player-1]++;
                    $('#note'+location).append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                }
                db.get('badge/'+groupNumber).then(function(doc) {
                    return db.put({
                        group: groupNumber,
                        note1: notes[0],
                        note2: notes[1],
                        note3: notes[2],
                        timer: 0
                    }, 'badge/'+groupNumber, doc._rev);
                });
            });
        },
        //-----------------Add progression to the progress bar
        attachRating: function(){
            var startKey = 'vote_'+groupNumber;
            db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: startKey+'_1',
                endkey: startKey+'_4\uffff'
            }).then(function(votes){
                var rating = [0,0,0];
                for(var i = 0; i < votes.rows.length; i++) {
                    var player = votes.rows[i].doc.player;
                    var location = votes.rows[i].doc.location;
                    // change check mark color
                    var checkMark = $('#location'+location+' span')[player-1];
                    $(checkMark).removeClass('grey');
                    $(checkMark).addClass('star-best');

                    // get the number of votes of each player
                    rating[player-1]++;
                }
                // change view of progressbar
                var progressbarText = $('.player p');
                for(var j = 1; j<=rating.length; j++){
                    $( "#progressbar"+j ).progressbar({
                        value: rating[j-1]
                    });
                    $(progressbarText[j-1]).text(rating[j-1] + '/4 Emplacements');
                }
                if(allRating == 3){
                    $('#toStep2').removeAttr('disabled');
                }
            });
        },
        //-----------------Add rating results to location card
        attachVotes: function(){
            var startKey = 'vote_'+groupNumber;
            db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: startKey,
                endkey: startKey+'\uffff'
            }).then(function(votes){
                var allVotes = [0,0,0,0,0,0,0,0], voteAvg = [0,0,0,0,0,0,0,0];
                for(var i = 0; i < votes.rows.length; i++) {
                    var location = parseInt(votes.rows[i].doc.location);
                    allVotes[location-1] += parseInt(votes.rows[i].doc.vote);
                }
                for(var j=0; j< votes.rows.length; j++){
                    voteAvg[j] = Math.round(allVotes[j]/3);
                    var num = j+1;
                    Server.setStars($('#vote'+num+' span'), voteAvg[j]);
                    Server.setCaption(num,voteAvg[j]);
                }
            });
        },
        secondStep: function(){
//            $('#toStep2').prop('disabled', true);
            $('#selectLocation').removeAttr('disabled');
            $('#submitChoice').removeAttr('disabled');
//            $('#step1').css('color', '#616161');
            $('#step2').css('color', white);

            $('.chooseLocation').show();

            Server.attachVotes();
            $('#timer2').countdown({
                image: "/img/digits.png",
                format: "mm:ss",
                startTime: "05:00"
            });
        },
        chooseLocation: function(element){
            var buttonValue = element.value.split(',');
            console.log(buttonValue);
            var location = parseInt(buttonValue[0]);
            var player = parseInt(buttonValue[1]);
            socket.emit('chooselocation', { location: location, player: player, group: groupNumber, aguflag: aguFlag});

            $('.visualPlayer'+player).hide();
            $('div#visualLocation'+location+' .visualPlayer'+player).show();

            var className = element.className;
            var elements = document.getElementsByClassName(className);
            $(elements).css({'background-color': '#5bc0de', 'border-color': '#46b8da'});
            $(element).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
            $($(elements)[location-1]).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
        },

        confirmChoice: function(map){
            clearInterval(intervals.main);
            $('#timer2').remove();
            //change checkbox
            var $check = $('#step2 .glyphicon');
            $check.removeClass('glyphicon-unchecked');
            $check.addClass('glyphicon-check');

            //change next step color
            $('#step3 .glyphicon').css('color', white);
            $('#step3 p').css('color', white);
            stepNumber++;
            aguFlag = true;
            socket.emit('confirmlocation', { location: chosenNumber});
            $('.location').hide();
            $('#location'+chosenNumber).show();
            $('.chooseLocation').hide();
//-----------------------to be improved
            socket.emit('chooselocation', { location: chosenNumber, player: 1, group: groupNumber});
            socket.emit('chooselocation', { location: chosenNumber, player: 2, group: groupNumber});
            socket.emit('chooselocation', { location: chosenNumber, player: 3, group: groupNumber});

//---------------------Final dialog
            var locationName = $('#location'+chosenNumber+' .submitChoice').attr('name');
            $('#gameEnd h4').first().text("Vous avez choisi l'emplacement '"+locationName+"' .");
            $('#gameEnd').dialog('open');

//--------------------add "Argumentaire" part onto the card
            var noteHeight = $('#location'+chosenNumber+' .note').height();

            var txt = '<div class="arguments">';
            txt += '<h4>Argumentaire :</h4>';
            txt += '<span></span>';
            txt += '</div>';
            $('#location'+chosenNumber+' .note').after(txt);
            $('.arguments').css({'margin-top':noteHeight + 'px'});
            $('#location'+chosenNumber).height(noteHeight + 400 +'px');

            db.get('decision/'+groupNumber).then(function(doc) {
                console.log("chosenNumber = "+chosenNumber);
                return db.put({
                    group: groupNumber,
                    location: chosenNumber
                }, 'decision/'+groupNumber, doc._rev);
            });
        },
        setStars: function(starArray, num){
            starArray.splice(num);
            starArray.removeClass('grey');
            starArray.addClass('star');
        },
        setCaption: function(num, vote){
            var color = ['#d9534f','#ec971f','#31b0d5','#337ab7','#449d44'];
            var caption= ['Très Faible', 'Faible', 'Moyen', 'Bon', 'Très Bon'];
            var label = $('#vote'+num+' .caption');
            label.text(caption[num-1]);
            label.css('background-color', color[num-1]);
        }
    };
    Server.init();
});


