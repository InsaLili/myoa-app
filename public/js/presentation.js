/**
 * Created by Lili on 08/04/15.
 */
var socket = io.connect('http://localhost:8000');
//var socket = io.connect('http://192.168.145.35:8000');
var db = new PouchDB('http://localhost:5984/locationlist');
//var db = new PouchDB('http://192.168.145.35:5984/locationlist');

var groupNumber = 0;
var chosenNumber = 0;
// DOM Ready =============================================================
$(document).ready(function() {
    $(document).on('contextmenu', function() {
        return false;
    });

//-------------------set insect information dialog
    $('#insectBtn').hide();
    $('#insectBtn1').on('click', function(){
        $('#insect1').dialog('open');
        $('#insectInfoWrap').touch();
    });
    $('#insectBtn2').on('click', function(){
        $('#insect2').dialog('open');
        $('#insectInfoWrap').touch();
    });
    $('#insectBtn3').on('click', function(){
        $('#insect3').dialog('open');
        $('#insectInfoWrap').touch();
    });
    $('#insectBtn4').on('click', function(){
        $('#insect4').dialog('open');
        $('#insectInfoWrap').touch();
    });
    $('.badges img').hide();

//------------------initialize progress bar;
    $( "#progressbar1" ).progressbar({
        max: 8
    });
    $( "#progressbar2" ).progressbar({
        max: 8
    });
    $( "#progressbar3" ).progressbar({
        max: 8
    });


//-------------------set tasks' buttons and color
    $('#toStep2').prop('disabled', true);
    $('#finalStepBtn').prop('disabled', true);

//------------------Enable multi-touch of location cards
//------------------Hide all location cards at first
    $('.location').touch();
    $('.location').hide();
//------------------Initialize each dialog

    $('#insect1').dialog({
        autoOpen: false,
        width: 800,
        height:600,
        buttons:{
            "OK": function(){
                $(this).dialog("close");
            }
        }
    });
    $('#insect2').dialog({
        autoOpen: false,
        width: 800,
        height:600,
        buttons:{
            "OK": function(){
                $(this).dialog("close");
            }
        }
    });
    $('#insect3').dialog({
        autoOpen: false,
        width: 600,
        height:400,
        buttons:{
            "OK": function(){
                $(this).dialog("close");
            }
        }
    });
    $('#insect4').dialog({
        autoOpen: false,
        width: 600,
        height:350,
        buttons:{
            "OK": function(){
                $(this).dialog("close");
            }
        }
    });


//--------------bind event to buttons

    $('.chooseGroupBtn').on('click', function(){
        $('#appLayer').show();
        $('#maskLayer').hide();
        $('.insectBtn').hide();
        groupNumber = parseInt($(this).val());
        socket.emit('choosegroup', { group: groupNumber});

        switch (groupNumber){
            case 1:
                $('#insectBtn1').show();
                break;
            case 2:
                $('#insectBtn2').show();
                break;
            case 3:
                $('#insectBtn3').show();
                break;
            case 4:
                $('#insectBtn4').show();
                break;
        }
//--------------------initialize map
        L.mapbox.accessToken = 'pk.eyJ1IjoiYXVyZWxpZW50IiwiYSI6Inh3NHZEWkUifQ.5xwAdbx7sU0mi-DT98e3VA';
        var map = L.mapbox.map('map', 'aurelient.m7apk42a', {
            zoomControl: false
        }).setView([45.394547, 5.890489], 15);
//------------------intialize function
        initMap(map);
        fetchGroupNum();
        attachBadge();
        attachRating();
        attachVotes();
    });

    $('#appLayer').hide();
});
function initMap(map) {
//------------------add markers
//------------------contents in markers
    var contentString1 = '<div>'+'<button type="button" class="btn player1 markerBtn" value="1,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+' <button type="button" class="btn player2 markerBtn" value="1,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+' <button type="button" class="btn player3 markerBtn" value="1,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button>'+'</div>';

    var contentString2 = '<div>'+'<button type="button" class="btn player1 markerBtn" value="2,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+' <button type="button" class="btn player2 markerBtn" value="2,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+' <button type="button" class="btn player3 markerBtn" value="2,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button>'+'</div>';

    var contentString3 = '<div>'+'<button type="button" class="btn player1 markerBtn" value="3,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+' <button type="button" class="btn player2 markerBtn" value="3,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+' <button type="button" class="btn player3 markerBtn" value="3,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button>'+'</div>';

    var contentString4 = '<div>'+'<button type="button" class="btn player1 markerBtn" value="4,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+' <button type="button" class="btn player2 markerBtn" value="4,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+' <button type="button" class="btn player3 markerBtn" value="4,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button>'+'</div>';

    var contentString5 = '<div>'+'<button type="button" class="btn player1 markerBtn" value="5,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+' <button type="button" class="btn player2 markerBtn" value="5,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+' <button type="button" class="btn player3 markerBtn" value="5,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button>'+'</div>';

    var contentString6 = '<div>'+'<button type="button" class="btn player1 markerBtn" value="6,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+' <button type="button" class="btn player2 markerBtn" value="6,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+' <button type="button" class="btn player3 markerBtn" value="6,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button>'+'</div>';

    var contentString7 = '<div>'+'<button type="button" class="btn player1 markerBtn" value="7,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+' <button type="button" class="btn player2 markerBtn" value="7,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+' <button type="button" class="btn player3 markerBtn" value="7,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button>'+'</div>';

    var contentString8 = '<div>'+'<button type="button" class="btn player1 markerBtn" value="8,1" onclick="chooseLocation(this)"><img src="/img/player1.png"></button> '+' <button type="button" class="btn player2 markerBtn" value="8,2" onclick="chooseLocation(this)"><img src="/img/player2.png"></button> '+' <button type="button" class="btn player3 markerBtn" value="8,3" onclick="chooseLocation(this)"><img src="/img/player3.png"></button>'+'</div>';

    var message = [contentString1, contentString2, contentString3, contentString4, contentString5, contentString6, contentString7, contentString8];

//    eight locations' coordinates
    var locations = [[5.892298,45.395142],[5.891826,45.391789],[5.888789,45.394547],[5.890012,45.398352],[5.586956, 45.3967333],[5.583952, 45.382626], [5.596728, 45.385155], [5.592169, 45.37759]];

    var myLayer = L.mapbox.featureLayer().addTo(map);

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
            "marker-symbol": "chemist",
            "marker-color": "#E91E63",
            "marker-size": "large"
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
            "coordinates": locations[4]
        },
        "properties": {
            "title": "<h4>Lycée N°1</h4>",
            "content": message[4],
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
            "content": message[5],
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
            "content": message[6],
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
            maxWidth: 350
        });
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
}

//-------------------get chosen number from the database
function fetchGroupNum(){
    db.get('decision/'+groupNumber).then(function(doc){
        console.log(doc);
        chosenNumber = doc.location;
        $('#location'+chosenNumber).show();
        attachNotes();
    });

}

//-------------------show badges
function attachBadge(){
    db.get('badge/'+groupNumber).then(function(doc){
        console.log(doc);
        if(doc.timer == 1){
            $('#timerBadge img').show();
        }
        var notebadge = $('.noteBadge img');
        if(doc.note1 >= 10){
            $(notebadge[0]).show();
        }
        if(doc.note2 >= 10){
            $(notebadge[1]).show();
        }
        if(doc.note3 >= 10){
            $(notebadge[2]).show();
        }
    })
}
//-----------------Add users' notes to the location cards
function attachNotes(){
    $('.location p').remove();
    var startKey = 'note_'+groupNumber+'_'+chosenNumber;
    db.allDocs({
        include_docs: true,
        attachements: true,
        startkey: startKey,
        endkey: startKey+'\uffff'
    }).then(function(locationData){
        console.log(locationData);
        for(var i = 0; i < locationData.rows.length; i++){
            var location = locationData.rows[i].doc.location;
            var player = locationData.rows[i].doc.author;
            var content = locationData.rows[i].doc.content;
            var id = locationData.rows[i].doc._id;
            $('#note'+chosenNumber).append('<p id='+id+' class="notePlayer'+player+'">'+content+'</p>');
        }
        attachAgus();

    });
}

//-----------------Add users' arguments to the location cards
function attachAgus(){
    var noteHeight = $('#location'+chosenNumber+' .note').height();
    var aguHeight = noteHeight + 180;
    $('.arguments').css({'margin-top':aguHeight + 'px'});
    $('#location'+chosenNumber).height(noteHeight + 300 +'px');

    var startKey = 'agu_'+groupNumber+'_'+chosenNumber;
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
            $('#arguments'+chosenNumber).append('<p id='+id+' class="aguPlayer'+player+'">'+content+'</p>');
        }

        var noteHeight = $('#location'+location+' .note').height();
        var aguHeight = $('#location'+location+' .arguments').height();
        $('#location'+location).height(noteHeight + aguHeight + 220 +'px');
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
        $(progressbarText[0]).text(rating1 + '/8 Emplacements');
        $(progressbarText[1]).text(rating2 + '/8 Emplacements');
        $(progressbarText[2]).text(rating3 + '/8 Emplacements');
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
