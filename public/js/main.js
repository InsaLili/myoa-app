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
                var visual = '<div class="visualPlayers"  id="visualLocation'+num+'"><h4>Visualisation :</h4><button type="button" class="btn player1 markerBtn" value="'+num+',1"><img src="/img/player1.png"></button><button type="button" class="btn player2 markerBtn" value="'+num+',2"><img src="/img/player2.png"></button><button type="button" class="btn player3 markerBtn" value="'+num+',3"><img src="/img/player3.png"></button></div>';

                var choose = '<div class="chooseLocation"><h4>Choisir cet emplacement:</h4><button class="btn btn-default btn-md submitChoice" name="'+name+'" value='+num+'>Choisir</button></div>';
                var vote = '<div class="vote" id="vote'+num+'"><h4>Évaluation :</h4><span class="glyphicon glyphicon-star grey"></span><span class="glyphicon glyphicon-star grey"></span><span class="glyphicon glyphicon-star grey"></span><span class="glyphicon glyphicon-star grey"></span><span class="glyphicon glyphicon-star grey"></span></div>';
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
            $('#toStep2').prop('disabled', true);
            $('#finalStepBtn').on('click',function(){
                $(this).prop('disabled', true);
                $('#finalDialog').dialog('open');
            });
            $('#finalStepBtn').prop('disabled', true);
            $('.submitChoice').on('click', Server.submitChoice);
            $('#step1').css('color', '#E0E0E0');
            $('#resetLocationBtn').on('click', Server.resetLocation);
            $('body').off('click').on('click', '.markerBtn', function(){
                Server.chooseLocation(this);
            });

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
            $('#toStep2').on('click', function(){
                db.get('badge/'+groupNumber).then(function(doc) {
                    var note1 = doc.note1;
                    var note2 = doc.note2;
                    var note3 = doc.note3;
                    var notebadge = $('.noteBadge img');

                    if(note1>=5){
                        $(notebadge[0]).show();
                        noteBadgeNumSum++;
                    }
                    if(note2>=5){
                        $(notebadge[1]).show();
                        noteBadgeNumSum++;
                    }
                    if(note3>=5){
                        $(notebadge[2]).show();
                        noteBadgeNumSum++
                    }

                    $('.winNoteBadge').text('Vous avez gagné '+noteBadgeNumSum+' badges Note!');

                    console.log('group'+groupNumber);
                    console.log('timerBadge'+timerBadgeNum);
                    return db.put({
                        group: groupNumber,
                        timer: timerBadgeNum,
                        note1: note1,
                        note2: note2,
                        note3: note3
                    }, 'badge/'+groupNumber, doc._rev);
                });
                //----------------stop the timer and check if the timer equal to zero
                clearInterval(intervals.main);
                var currentTime = digits[0].current + digits[1].current +digits[2].current + digits[3].current;
                var noteBadgeNumSum=0;
                var timerBadgeNum = 0;
                if(digits[1].current != 9){
                    $('#secondStepDialog').dialog('open');
                    $('#timerBadge img').show();
                    timerBadgeNum = 1;
                }else{
                    $('#secondStepDialog_noBadge').dialog('open');
                }
                $('#timer1').remove();
            });

            $('.chooseGroupBtn').on('click', function(){
                $('#appLayer').show();
                $('#maskLayer').hide();
                groupNumber = parseInt($(this).val());
                socket.emit('choosegroup', { group: groupNumber});
                //--------------------initialize map
                Server.mapInit();
                Server.attachNotes();
                Server.attachRating();
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
            });
            $('#appLayer').hide();
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
                switch (location){
                    case 1:
                        $('#note1').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                        break;
                    case 2:
                        $('#note2').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                        break;
                    case 3:
                        $('#note3').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                        break;
                    case 4:
                        $('#note4').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                        break;
                    case 5:
                        $('#note5').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                        break;
                    case 6:
                        $('#note6').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                        break;
                    case 7:
                        $('#note7').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                        break;
                    case 8:
                        $('#note8').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                        break;
                }
                var noteHeight = $('#location'+location+' .note').height();
                if(noteHeight+200 > 350){
                    $('#location'+location).height(noteHeight + 200 +'px');
                }else{
                    $('#location'+location).height(350+'px');
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
                //    if(noteHeight+200 > 350){
                $('#location'+location).height(noteHeight + aguHeight + 220 +'px');
                //    }else{
                //        $('#location'+location).height(350+'px');
                //    }
            });


            socket.on('deletenote', function (data) {
                console.log(data);
                var id = data.id;
                $('#'+id).remove();
                var location = data.location;
                var player = data.player;
                var notes = data.notes;
                var noteHeight = $('#location'+location+' .note').height();
                if(noteHeight+200 > 350){
                    $('#location'+location).height(noteHeight + 200 +'px');
                }else{
                    $('#location'+location).height(350+'px');
                }
            });

            socket.on('deleteagu', function (data) {
                console.log(data);
                var id = data.id;
                $('#'+id).remove();
                var location = data.location;
                var player = data.player;
                var noteHeight = $('#location'+location+' .note').height();
                if(noteHeight+200 > 350){
                    $('#location'+location).height(noteHeight + 200 +'px');
                }else{
                    $('#location'+location).height(350+'px');
                }
                var noteHeight = $('#location'+location+' .note').height();
                var aguHeight = $('#location'+location+' .arguments').height();
                //    if(noteHeight+200 > 350){
                $('#location'+location).height(noteHeight + aguHeight + 220 +'px');
                //    }else{
                //        $('#location'+location).height(350+'px');
                //    }
            });

            socket.on('vote', function(data){
                var location = data.location;
                var player = data.player;
                var rating = 0;
                var progressbar;
                switch (player){
                    case 1:
                        progressbar = $("#progressbar1");
                        rating = parseInt(progressbar. attr("aria-valuenow"));
                        rating++;
                        progressbar.progressbar({
                            value: rating
                        });
                        progressbar.next().text(rating + '/4 Emplacements');
                        break;
                    case 2:
                        progressbar = $("#progressbar2");
                        rating = parseInt(progressbar. attr("aria-valuenow"));
                        rating++;
                        progressbar.progressbar({
                            value: rating
                        });
                        progressbar.next().text(rating + '/4 Emplacements');
                        break;
                    case 3:
                        progressbar = $("#progressbar3");
                        rating = parseInt(progressbar. attr("aria-valuenow"));
                        rating++;
                        progressbar.progressbar({
                            value: rating
                        });
                        progressbar.next().text(rating + '/4 Emplacements');
                        break;
                }
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
                var note1 = 0;
                var note2 = 0;
                var note3 = 0;
                for(var i = 0; i < locationData.rows.length; i++){
                    var location = locationData.rows[i].doc.location;
                    var player = locationData.rows[i].doc.author;
                    var content = locationData.rows[i].doc.content;
                    var id = locationData.rows[i].doc._id;
                    switch (player){
                        case 1:
                            note1++;
                            break;
                        case 2:
                            note2++;
                            break;
                        case 3:
                            note3++;
                            break;
                    }
                    switch (location){
                        case 1:
                            $('#note1').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                            break;
                        case 2:
                            $('#note2').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                            break;
                        case 3:
                            $('#note3').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                            break;
                        case 4:
                            $('#note4').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                            break;
                        case 5:
                            $('#note5').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                            break;
                        case 6:
                            $('#note6').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                            break;
                        case 7:
                            $('#note7').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                            break;
                        case 8:
                            $('#note8').append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
                            break;
                    }
                }
                db.get('badge/'+groupNumber).then(function(doc) {
                    return db.put({
                        group: groupNumber,
                        note1: note1,
                        note2: note2,
                        note3: note3,
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
                var rating1=0, rating2=0, rating3=0;
                for(var i = 0; i < votes.rows.length; i++) {
                    var player = votes.rows[i].doc.player;
                    switch(player){
                        case 1:
                            rating1++;
                            break;
                        case 2:
                            rating2++;
                            break;
                        case 3:
                            rating3++;
                            break;
                    }
                }
                $( "#progressbar1" ).progressbar({
                    value: rating1
                });
                $( "#progressbar2" ).progressbar({
                    value: rating2
                });
                $( "#progressbar3" ).progressbar({
                    value: rating3
                });
                var progressbarText = $('.player p');
                $(progressbarText[0]).text(rating1 + '/4 Emplacements');
                $(progressbarText[1]).text(rating2 + '/4 Emplacements');
                $(progressbarText[2]).text(rating3 + '/4 Emplacements');

                if(allRating == 3){
                    $('#toStep2').removeAttr('disabled');
                }
            });},
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
                }
            });
        },
        secondStep: function(){
            $('#toStep2').prop('disabled', true);
            $('#selectLocation').removeAttr('disabled');
            $('#submitChoice').removeAttr('disabled');
            $('#step1').css('color', '#616161');
            $('#step2').css('color', '#E0E0E0');

            $('.chooseLocation').show();
            $('.visualPlayers').hide();

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
        submitChoice: function(){
            clearInterval(intervals.main);
            $('#timer2').remove();
            chosenNumber = parseInt($(this).val());
            var locationName = $(this).attr("name");
            $('#choiceConfirm h4').text("Voulez vous choisir l'emplacement '"+locationName+"' ?");
            $( "#choiceConfirm" ).dialog( "open");
        },
        confirmChoice: function(map){
            $('#step1').css('color', '#616161');
            $('#step2').css('color', '#616161');
            $('#step3').css('color', '#E0E0E0');
            $('#finalStepBtn').removeAttr('disabled');
            aguFlag = true;

            socket.emit('confirmlocation', { location: chosenNumber});
            $('#school').prop('disabled', true);
            $('#mountain').prop('disabled', true);
            $('.locations').show();
            $('.location').hide();
//            chosenNumber<5?map.panTo([45.394547, 5.890489]): map.panTo([45.387638, 5.587997]);
            $('#location'+chosenNumber).show();
            $('.chooseLocation').hide();
            $('.visualPlayers').show();
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
            var aguHeight = noteHeight + 180;
            $('.arguments').css({'margin-top':aguHeight + 'px'});
            $('#location'+chosenNumber).height(noteHeight + 300 +'px');


            db.get('decision/'+groupNumber).then(function(doc) {
                console.log("chosenNumber = "+chosenNumber);
                return db.put({
                    group: groupNumber,
                    location: chosenNumber
                }, 'decision/'+groupNumber, doc._rev);
            });
        },
        resetLocation: function(){
            if($('.locations').css('display') !== "none"){
                var $location = $('.location');
                $location.touch();
                $location.css({'-webkit-transform' : 'rotate(0deg)',
                    '-moz-transform' : 'rotate(0deg)',
                    '-ms-transform' : 'rotate(0deg)',
                    'transform' : 'rotate(0deg)'});
            }
        },
        setStars: function(starArray, num){
            var color = ['star-worst','star-bad','star-normal','star-good','star-best'];
            starArray.splice(num);
            starArray.removeClass('grey');
            starArray.addClass('star');
        }
    };
    Server.init();
});


