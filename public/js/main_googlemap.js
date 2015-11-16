/**
 * Created by Lili on 08/04/15.
 */
var db = new PouchDB('http://192.168.145.53:5984/insect');
var socket = io.connect('http://192.168.145.53:8000');
//var db = new PouchDB('http://192.168.1.49:8080/insect');
//var socket = io.connect('http://192.168.1.49:8000');

var groupNumber = 1;
var allRating = 0;
var chosenNumber = 0;
var aguFlag = false;
//------------------add markers
//------------------contents in markers
var contentString1 = '<div id="marker1">'+'<img class= "markerImg" src="/img/balcon.jpg">'+'<button type="button" class="btn player1 markerBtn" value="1,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+'<img class="markerCheck1" src="/img/uncheck.png">'+' <button type="button" class="btn player2 markerBtn" value="1,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player3 markerBtn" value="1,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button>'+'<img class="markerCheck" src="/img/uncheck.png">'+'</div>';

var contentString2 = '<div id="marker2">'+'<img class= "markerImg" src="/img/embruns.jpg">'+'<button type="button" class="btn player1 markerBtn" value="2,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player2 markerBtn" value="2,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player3 markerBtn" value="2,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button>'+'<img class="markerCheck" src="/img/uncheck.png">'+'</div>';

var contentString3 = '<div id="marker3">'+ '<img class= "markerImg" src="/img/sentier.jpg">'+'<button type="button" class="btn player1 markerBtn" value="3,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player2 markerBtn" value="3,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player3 markerBtn" value="3,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+'</div>';

var contentString4 = '<div id="marker4">'+ '<img class= "markerImg" src="/img/clairiere.jpg">'+'<button type="button" class="btn player1 markerBtn" value="4,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player2 markerBtn" value="4,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player3 markerBtn" value="4,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+'</div>';

var contentString5 = '<div id="marker5">'+ '<img class= "markerImg" src="/img/school4.jpg">'+'<button type="button" class="btn player1 markerBtn" value="5,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player2 markerBtn" value="5,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player3 markerBtn" value="5,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+'</div>';

var contentString6 = '<div id="marker6">'+ '<img class= "markerImg" src="/img/school1.jpg">'+'<button type="button" class="btn player1 markerBtn" value="6,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player2 markerBtn" value="6,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player3 markerBtn" value="6,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+'</div>';

var contentString7 = '<div id="marker7">'+ '<img class= "markerImg" src="/img/school2.jpg">'+'<button type="button" class="btn player1 markerBtn" value="7,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player2 markerBtn" value="7,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player3 markerBtn" value="7,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+'</div>';

var contentString8 = '<div id="marker8">'+ '<img class= "markerImg" src="/img/school3.jpg">'+'<button type="button" class="btn player1 markerBtn" value="8,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player2 markerBtn" value="8,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+' <button type="button" class="btn player3 markerBtn" value="8,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button> '+'<img class="markerCheck" src="/img/uncheck.png">'+'</div>';

var message = [contentString1, contentString2, contentString3, contentString4, contentString5, contentString6, contentString7, contentString8];

// DOM Ready =============================================================
$(document).ready(function() {
    $(document).on('contextmenu', function() {
        return false;
    });

//-------------------set insect information dialog
    $('#insectBtn').on('click', function(){
        $('#insectDialog').dialog('open');
        $('#insectInfoWrap').touch();
    });
   $('.badges img').hide();

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
    $('.submitChoice').on('click', submitChoice);
    $('#step1').css('color', '#E0E0E0');
    $('#resetLocationBtn').on('click', resetLocation);

//------------------Enable multi-touch of location cards
//------------------Hide school location cards at first
//------------------Set initial position of each card
    $('.location').touch();
    $('.schoolLocations').hide();
    $('.chooseLocation').hide();
    $('.visualPlayer').hide();
    var $mountain = $('.mountainLocations .location');
    $($($mountain)[3]).offset({top: 250, left: 400});
    $($($mountain)[0]).offset({top: 250, left: 1100});
    $($($mountain)[2]).offset({top: 700, left: 400});
    $($($mountain)[1]).offset({top: 700, left: 1100});

    var $school = $('.schoolLocations .location');
    $($($school)[0]).offset({top: 50, left: 400});
    $($($school)[2]).offset({top: 50, left: 1100});
    $($($school)[1]).offset({top: 500, left: 400});
    $($($school)[3]).offset({top: 500, left: 1100});


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

//--------------bind event to buttons
    $('#toStep2').on('click', function(){

        //----------------stop the timer and check if the timer equal to zero
        clearInterval(intervals.main);
        $('#timer1').remove();
        var currentTime = digits[0].current + digits[1].current +digits[2].current + digits[3].current;
        var noteBadgeNumSum=0;
        var timerBadgeNum = 0;
        if(currentTime !==0){
            $('#secondStepDialog').dialog('open');
            $('#timerBadge img').show();
            timerBadgeNum = 1;
        }else{
            $('#secondStepDialog').dialog('open');
        }

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

            $('#winNoteBadge').text('Vous avez gagné '+noteBadgeNumSum+' badges Note!');

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
    });

    $('#appLayer').show();
    $('#maskLayer').hide();
//--------------------initialize map
    L.mapbox.accessToken = 'pk.eyJ1IjoiYXVyZWxpZW50IiwiYSI6Inh3NHZEWkUifQ.5xwAdbx7sU0mi-DT98e3VA';
    var map = L.mapbox.map('map', 'insalili.meikk0a8', {
        zoomControl: false
    }).setView([45.394547, 5.890489], 15);
    //    eight locations' coordinates
    var locations = [[5.892298,45.395142],[5.891826,45.391789],[5.888789,45.394547],[5.890012,45.398352],[5.586956, 45.3967333],[5.583952, 45.382626], [5.596728, 45.385155], [5.592169, 45.37759]];

    myLayer = L.mapbox.featureLayer().addTo(map);


//-----------------------JSON data for markers
    var geoJson = [{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": locations[0]
        },
        "properties": {
            "title": "<h4>Balcon sur la cascade</h4>",
            "content": message[0],
            "image":"img/balcon.jpg",
            "marker-symbol": "chemist",
            "marker-color": "#E91E63",
            "marker-size": "large",
            "number": 0
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": locations[1]
        },
        "properties": {
            "title": "<h4>Sous les embruns</h4>",
            "content": message[1],
            "marker-symbol": "chemist",
            "marker-color": "#E91E63",
            "marker-size": "large"
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": locations[2]
        },
        "properties": {
            "title": "<h4>Au détour du sentier</h4>",
            "content": message[2],
            "marker-symbol": "chemist",
            "marker-color": "#E91E63",
            "marker-size": "large"
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": locations[3]
        },
        "properties": {
            "title": "<h4>La clairière</h4>",
            "content": message[3],
            "marker-symbol": "chemist",
            "marker-color": "#E91E63",
            "marker-size": "large"
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": locations[7]
        },
        "properties": {
            "title": "<h4>Lycée N°4</h4>",
            "content": message[4],
            "marker-symbol": "chemist",
            "marker-color": "#E91E63",
            "marker-size": "large"
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": locations[4]
        },
        "properties": {
            "title": "<h4>Lycée N°1</h4>",
            "content": message[5],
            "marker-symbol": "chemist",
            "marker-color": "#E91E63",
            "marker-size": "large"
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": locations[5]
        },
        "properties": {
            "title": "<h4>Lycée N°2</h4>",
            "content": message[6],
            "marker-symbol": "chemist",
            "marker-color": "#E91E63",
            "marker-size": "large"
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": locations[6]
        },
        "properties": {
            "title": "<h4>Lycée N°3</h4>",
            "content": message[7],
            "marker-symbol": "chemist",
            "marker-color": "#E91E63",
            "marker-size": "large"
        }
    }];

    myLayer.on('layeradd', function(e) {
        var marker = e.layer,
            feature = marker.feature;

        var popupContent = feature.properties.title + feature.properties.content;

        marker.bindPopup(popupContent,{
            closeButton: false,
            minWidth:400,
            maxWidth: 400
        });
    });
    myLayer.on('click',function(e) {
        e.layer.unbindPopup();
        var marker = e.layer,
            feature = marker.feature;

        var popupContent = feature.properties.title + message[feature.properties.number];

        marker.bindPopup(popupContent,{
            closeButton: false,
            minWidth:400,
            maxWidth: 400
        });
        e.layer.setIcon(L.mapbox.marker.icon(feature.properties));
    });

//----------------Add features to the map.
    myLayer.setGeoJSON(geoJson);

//----------------change focus between mountain and school
    $('#mountainTab').on('click', function(){
        $(this).addClass('activeTab');
        $('#schoolTab').removeClass('activeTab');
        $('.mountainLocations').show();
        $('.schoolLocations').hide();
        map.panTo([45.394547, 5.890489]);
    });
    $('#schoolTab').on('click', function(){
        $(this).addClass('activeTab');
        $('#mountainTab').removeClass('activeTab');
        $('.schoolLocations').show();
        $('.mountainLocations').hide();
        map.panTo([45.387638, 5.587997]);
    });
    attachNotes();
    attachRating();
    $( "#choiceConfirm" ).dialog({
        autoOpen: false,
        width:500,
        height:200,
        modal: true,
        buttons: {
            "Oui": function() {
                $( this ).dialog( "close" );
                confirmChoice(map);
            },
            "Non": function() {
                $( this ).dialog( "close" );
            }
        }
    });

    socket.on('vote', function(data){
        var location = data.location;
        var checkMarks = $('#marker'+location+' .markerCheck1');
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
                checkMarks[0].src = checkMarks[0].src.replace("uncheck.png", "check.png");
                message[location-1] = message[location-1].replace('markerCheck1" src="/img/uncheck','markerCheck1" src="/img/check');
                break;
            case 2:
                progressbar = $("#progressbar2");
                rating = parseInt(progressbar. attr("aria-valuenow"));
                rating++;
                progressbar.progressbar({
                    value: rating
                });
                progressbar.next().text(rating + '/4 Emplacements');
                $(checkMarks[1]).show();
                break;
            case 3:
                progressbar = $("#progressbar3");
                rating = parseInt(progressbar. attr("aria-valuenow"));
                rating++;
                progressbar.progressbar({
                    value: rating
                });
                progressbar.next().text(rating + '/4 Emplacements');
                $(checkMarks[2]).show();
                break;
        }
        if(allRating == 3){
            $('#toStep2').removeAttr('disabled');
        }
    });
});

//-----------------Add users' notes to the location cards
function attachNotes(){
    $('.location p').remove();
    var startKey = 'note_'+groupNumber;
    db.allDocs({
        include_docs: true,
        attachements: true,
        startkey: startKey,
        endkey: startKey+'\uffff'
    }).then(function(locationData){
        for(var i = 0; i < locationData.rows.length; i++){
            var location = locationData.rows[i].doc.location;
            var player = locationData.rows[i].doc.author;
            var content = locationData.rows[i].doc.content;
            var id = locationData.rows[i].doc._id;
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
    });
}

//-----------------Add progression to the progress bar
function attachRating(){
    var startKey = 'vote_'+groupNumber;
    db.allDocs({
        include_docs: true,
        attachements: true,
        startkey: startKey,
        endkey: startKey+'\uffff'
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
    });
}

//-----------------Add rating results to location card
function attachVotes(event){
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
            switch (location){
                case 1:
                    allVotes[0] += parseInt(votes.rows[i].doc.vote);
                    break;
                case 2:
                    allVotes[1] += parseInt(votes.rows[i].doc.vote);
                    break;
                case 3:
                    allVotes[2] += parseInt(votes.rows[i].doc.vote);
                    break;
                case 4:
                    allVotes[3] += parseInt(votes.rows[i].doc.vote);
                    break;
                case 5:
                    allVotes[4] += parseInt(votes.rows[i].doc.vote);
                    break;
                case 6:
                    allVotes[5] += parseInt(votes.rows[i].doc.vote);
                    break;
                case 7:
                    allVotes[6] += parseInt(votes.rows[i].doc.vote);
                    break;
                case 8:
                    allVotes[7] += parseInt(votes.rows[i].doc.vote);
                    break;
            }
        }
        voteAvg[0] = Math.round(allVotes[0]/3);
        voteAvg[1] = Math.round(allVotes[1]/3);
        voteAvg[2] = Math.round(allVotes[2]/3);
        voteAvg[3] = Math.round(allVotes[3]/3);
        voteAvg[4] = Math.round(allVotes[4]/3);
        voteAvg[5] = Math.round(allVotes[5]/3);
        voteAvg[6] = Math.round(allVotes[6]/3);
        voteAvg[7] = Math.round(allVotes[7]/3);
        $('#input1').rating('update', voteAvg[0]);
        $('#input2').rating('update', voteAvg[1]);
        $('#input3').rating('update', voteAvg[2]);
        $('#input4').rating('update', voteAvg[3]);
        $('#input5').rating('update', voteAvg[4]);
        $('#input6').rating('update', voteAvg[5]);
        $('#input7').rating('update', voteAvg[6]);
        $('#input8').rating('update', voteAvg[7]);
    });
}

function secondStep(){
    $('#toStep2').prop('disabled', true);
    $('#selectLocation').removeAttr('disabled');
    $('#submitChoice').removeAttr('disabled');
    $('#step1').css('color', '#616161');
    $('#step2').css('color', '#E0E0E0');

    $('.chooseLocation').show();
    $('.visualPlayers').hide();

    attachVotes();
    $('#timer2').countdown({
        image: "/img/digits.png",
        format: "mm:ss",
        startTime: "05:00"
    });
}

function chooseLocation(element){
    var buttonValue = element.value.split(',');
    console.log(buttonValue);
    var location = parseInt(buttonValue[0]);
    var player = parseInt(buttonValue[1]);
    socket.emit('chooselocation', { location: location, player: player, group: groupNumber, aguflag: aguFlag});

    $('.visualPlayer'+player).hide();
    $('div#visualLocation'+location+' .visualPlayer'+player).show();

    var className = element.className;
    var elements = document.getElementsByClassName(className);
    $(elements).css('background-color', '#5bc0de');
    $(element).css({'background-color': '#f0ad4e', 'border-color': '#eea236'});
}

function submitChoice(){
    clearInterval(intervals.main);
    $('#timer2').remove();
    chosenNumber = parseInt($(this).val());
    var locationName = $(this).attr("name");
    $('#choiceConfirm h4').text("Voulez vous choisir l'emplacement '"+locationName+"' ?");
    $( "#choiceConfirm" ).dialog( "open");

}

function confirmChoice(map){
    $('#step1').css('color', '#616161');
    $('#step2').css('color', '#616161');
    $('#step3').css('color', '#E0E0E0');
    $('#finalStepBtn').removeAttr('disabled');
    aguFlag = true;
    
    socket.emit('confirmlocation', { location: chosenNumber});
    $('#school').prop('disabled', true);
    $('#mountain').prop('disabled', true);
    $('.mountainLocations').show();
    $('.schoolLocations').show();
    $('.location').hide();
    chosenNumber<5?map.panTo([45.394547, 5.890489]): map.panTo([45.387638, 5.587997]);
    $('#location'+chosenNumber).show();
    $('.chooseLocation').hide();
    $('.visualPlayers').show();
//-----------------------to be improved
    socket.emit('chooselocation', { location: chosenNumber, player: 1, group: groupNumber});
    socket.emit('chooselocation', { location: chosenNumber, player: 2, group: groupNumber});
    socket.emit('chooselocation', { location: chosenNumber, player: 3, group: groupNumber});

//---------------------Final dialog
    var locationName = $('#location'+chosenNumber+' button').attr('name');
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
            location: chosenNumber,
        }, 'decision/'+groupNumber, doc._rev);
    });
}
function resetLocation(){
    
    if($('.mountainLocations').css('display') !== "none"){
        var $mountain = $('.mountainLocations .location');
        $mountain.touch();
        $mountain.css({'-webkit-transform' : 'rotate(0deg)',
                 '-moz-transform' : 'rotate(0deg)',
                 '-ms-transform' : 'rotate(0deg)',
                 'transform' : 'rotate(0deg)'});
    }

    if($('.schoolLocations').css('display') !== "none"){
        var $school = $('.schoolLocations .location');
        $school.touch();
        $school.css({'-webkit-transform' : 'rotate(0deg)',
                 '-moz-transform' : 'rotate(0deg)',
                 '-ms-transform' : 'rotate(0deg)',
                 'transform' : 'rotate(0deg)'});
    }

}
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


function initMap(map) {



}


