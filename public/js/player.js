
// DOM Ready =============================================================
$(document).ready(function($){
    $(document).on('contextmenu', function() {
        return false;
    });


    // Variables =============================================================
    var locationNumber=0;
    var groupNumber = 0;
    var playerNumber = 0;
    var allNotes = 0;
    var locationName = [
        "Balcon sur la cascade",
        "Sous les embruns",
        "Au détour du sentier",
        "La clairière",
        "Lycée N°1",
        "Lycée N°2",
        "Lycée N°3",
        "Lycée N°4"
    ];

    var db = new PouchDB('http://localhost:5984/insect');
    var socket = io.connect('http://localhost:8000');

    var Client = {
        init: function(){
            $('#appLayer').hide();

            //set avatar src based on user's choice
            var imgSrc = ['img/player1.png','img/player2.png','img/player3.png'];

            //------------------hide arguments part
            $('#showAgu').hide();
            $('#addAgu').hide();

            //------------------click events for validation btns
            $('#submitNote').on('click', Client.addNote);
            $('#submitAgu').on('click', Client.addAgu);
            $('#vote').on('click', '.rating-container', Client.addVote);
//            $('.rating-container').on('click', Client.addVote);
//            $("#submitVote").on('click', Client.addVote);
            $('#avatar').on('click', function(){
                if (screenfull.enabled) {
                    screenfull.request();
                } else {
                    // Ignore or do something else
                }
            });

            $("#showNotes").on('click', '.deletenote', function(){
                Client.deleteNote(this.id);
            });

            $("#showAgu").on('click', '.deleteagu', function(){
                Client.deleteAgu(this.id);
            });

            $('.choosePlayerBtn').on('click', function(){
                $('#maskLayer').hide();
                $('#appLayer').show();

                playerNumber = parseInt($(this).val());
                $('#avatar img').attr('src',imgSrc[playerNumber-1]);
                Client.dialogInit();
                Client.serviceInit();
            });
        },

        //------------------dialog initiation
        dialogInit: function(){
            $( '#chooseLocationDlg' ).dialog({
                autoOpen: false,
                height:200,
                modal: true,
                buttons:{
                    "OK": function(){
                        $(this).dialog("close");
                    }
                }
            });
            $( '#writeNoteDlg' ).dialog({
                autoOpen: false,
                height:200,
                modal: true,
                buttons:{
                    "OK": function(){
                        $(this).dialog("close");
                    }
                }
            });
//            $( "#voteConfirm" ).dialog({
//                autoOpen: false,
//                height:200,
//                modal: true,
//                buttons: {
//                    "Oui": function() {
//                        Client.confirmVote();
//                        $( this ).dialog( "close" );
//                    },
//                    "Non": function() {
//                        $( this ).dialog( "close" );
//                    }
//                }
//            });
        },

        //------------------communication via server
        serviceInit: function(){
            socket.on('choosegroup', function(data){
                console.log(data);
                groupNumber = data.group;
            });
            socket.on('chooselocation', function (data) {
                var player = data.player;
                if(player == playerNumber){
                    var flag = data.aguflag;
                    locationNumber = data.location;
                    groupNumber = data.group;
                    Client.showInfoOnTable();
                    Client.attachNote();
                    Client.attachVote();
                    $('#myNote textarea').val('');
                    if(flag == true){
                        $('#showAgu').show();
                        $('#addAgu').show();
                        $('#showNotes').hide();
                        $('#addNotes').hide();
                    }
                }
            });
            socket.on('confirmlocation', function (data) {
                locationNumber = data.location;
                Client.showInfoOnTable();
                $('#showAgu').show();
                $('#addAgu').show();
                $('#showNotes').hide();
                $('#addNotes').hide();
            });
        },

        // count the number of notes
        getNoteNumber: function(){
            var startKey = 'note_'+groupNumber;
            db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: startKey,
                endkey: startKey+'\uffff'
            }).then(function(notes){
                for(var i=0; i < notes.rows.length; i++){
                    if(notes.rows[i].doc.author == playerNumber){
                        allNotes++;
                    }
                }
            });
        },

        // show location information on personal device
        showInfoOnTable: function(){
            var elements = $('#locationDetail').find('span');
            //    update location name
            var name = locationName[locationNumber-1];
//            switch (locationNumber){
//                case 1:
//                    locationName = "Balcon sur la cascade";
//                    break;
//                case 2:
//                    locationName = "Sous les embruns";
//                    break;
//                case 3:
//                    locationName = "Au détour du sentier";
//                    break;
//                case 4:
//                    locationName = "La clairière";
//                    break;
//                case 5:
//                    locationName = "Lycée N°4";
//                    break;
//                case 6:
//                    locationName = "Lycée N°1";
//                    break;
//                case 7:
//                    locationName = "Lycée N°2";
//                    break;
//                case 8:
//                    locationName = "Lycée N°3";
//                    break;
//            }
            $('#dataLocation').text(name);

//    show information of each location
            db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: 'measure',
                endkey: 'measure\uffff'
            }).then(function(locationData){
                var group = 0;
                for(var i = 0; i < locationData.rows.length; i++){
                    var number = locationData.rows[i].doc.location;
                    if(number == locationNumber){
                        var oneLocationData = locationData.rows[i].doc;
                        $(elements[group]).text(oneLocationData.Light);
                        $(elements[group+5]).text(oneLocationData.Wind);
                        $(elements[group+10]).text(oneLocationData.Temperature);
                        $(elements[group+15]).text(oneLocationData.PH);
                        group++;
                    }
                }
            });
        },

        attachNote: function(){
            $("#showNotes span").empty();

            //     show notes of each player
            var startKey = 'note_'+groupNumber+'_'+locationNumber+'_'+playerNumber;
            db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: startKey,
                endkey: startKey+'\uffff'
            }).then(function(notes){
                var noteContent = '';
                for(var i=0; i < notes.rows.length; i++){
                    var note = notes.rows[i].doc;
                    noteContent += '<div class = "noteOfPlayer">';
                    noteContent += '<p>'+note.content+'</p>';
                    noteContent += '<button id="'+note._id+'" class="btn btn-default btn-xs deletenote">'+'Effacer'+'</button>';
                    noteContent += '</div>';
                }
                $('#showNotes span').html(noteContent);
            });
        },

        attachVote:  function(){
            var startKey = 'vote_'+groupNumber+'_'+locationNumber+'_'+playerNumber;
            var input = $('#input');

            db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: startKey,
                endkey: startKey+'\uffff'
            }).then(function(vote){
                if(vote.rows.length !== 0){
                    var voteValue = vote.rows[0].doc.vote;
                    input.rating('update', voteValue);
                    input.rating('refresh', {disabled: false});
//                    $('#submitVote').prop('disabled', true);
                }else{
                    input.rating('update', 0);
                    input.rating('refresh', {disabled: false});
//                    $('#submitVote').removeAttr('disabled');
                }
            });
        },

        addNote: function(event){
            event.preventDefault();

            if(!locationNumber){
                $('#chooseLocationDlg').dialog('open');
                return;
            }
//    if textarea is empty, return false
            var textarea = $('#myNote textarea');
            var text = textarea.val();
            if(!text){
                $('#writeNoteDlg').dialog('open');
                return;
            }

            var startKey = 'note_'+groupNumber+'_'+locationNumber+'_'+playerNumber;
            var noteNumber;
            db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: startKey,
                endkey: startKey+'\uffff'
            }).then(function(notes){
//        如果之前已经有note，则noteNumber为之前最后一条note的number加1
//        如果没有，则noteNumber为1
                if(notes.rows.length !== 0){
                    noteNumber = notes.rows[notes.rows.length-1].doc.number+1;
                }else{
                    noteNumber = 1;
                }
//        the new id for new note
                var id = 'note_'+groupNumber+'_'+locationNumber+'_'+playerNumber+'_'+noteNumber;
                db.put({
                    _id: id,
                    "type": "note",
                    "group": groupNumber,
                    "location": locationNumber,
                    "author": playerNumber,
                    "number": noteNumber,
                    'content':text
                }).then(function(){
                    $('#showNotes span').append('<div class="noteOfPlayer">'+'<p>'+text+'</p>'+'<button id='+id+'  class="btn btn-default btn-xs deletenote" >Effacer</button>'+'</div>');
                    allNotes++;
                    socket.emit('addnote', {id: id, content: text, location: locationNumber, player: playerNumber, notes: allNotes});
                });
            });
            db.get('badge/'+groupNumber).then(function(doc){
                console.log(doc);
                var note1 = doc.note1;
                var note2 = doc.note2;
                var note3 = doc.note3;
                var timer = doc.timer;
                note1++;
                return db.put({
                    group: groupNumber,
                    note1: note1,
                    note2: note2,
                    note3: note3,
                    timer: timer
                }, 'badge/'+groupNumber, doc._rev);
            });

            //    clear textarea
            textarea.val('');
        },

        addAgu: function(event){
            event.preventDefault();

            if(!locationNumber){
                $('#chooseLocationDlg').dialog('open');
                return;
            }

            //    clear textarea
            var textarea = $('#myAgu textarea');
            var text = textarea.val();
            if(!text){
                $('#writeNoteDlg').dialog('open');
                return;
            }

            var startKey = 'agu_'+groupNumber+'_'+locationNumber+'_'+playerNumber;
            var aguNumber;
            db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: startKey,
                endkey: startKey+'\uffff'
            }).then(function(agus){

            //        如果之前已经有note，则noteNumber为之前最后一条note的number加1
            //        如果没有，则noteNumber为1
                if(agus.rows.length !== 0){
                    aguNumber = agus.rows[agus.rows.length-1].doc.number+1;
                }else{
                    aguNumber = 1;
                }
//        the new id for new note
                var id = 'agu_'+groupNumber+'_'+locationNumber+'_'+playerNumber+'_'+aguNumber;
                db.put({
                    _id: id,
                    "type": "agu",
                    "group": groupNumber,
                    "location": locationNumber,
                    "author": playerNumber,
                    "number": aguNumber,
                    'content':text
                }).then(function(){
                    $('#showAgu span').append('<div class="aguOfPlayer">'+'<p>'+text+'</p>'+'<button id='+id+'  class="btn btn-default btn-xs deleteagu">Effacer</button>'+'</div>');
                    socket.emit('addagu', {id: id, content: text, location: locationNumber, player: playerNumber});
                });
            });

            //    clear textarea
            textarea.val('');
        },

        deleteNote: function(id){
            db.get(id).then(function(doc){
                return db.remove(doc);
            }).then(function(){
                $('#'+id).parent().remove();
                allNotes--;
                socket.emit('deletenote', {id: id, location: locationNumber, player: playerNumber, notes: allNotes});
            });
            db.get('badge/'+groupNumber).then(function(doc){
                console.log(doc);
                var note1 = doc.note1;
                var note2 = doc.note2;
                var note3 = doc.note3;
                var timer = doc.timer;
                note1--;
                return db.put({
                    group: groupNumber,
                    note1: note1,
                    note2: note2,
                    note3: note3,
                    timer: timer
                }, 'badge/'+groupNumber, doc._rev);
            });
        },

        deleteAgu: function(id){
            db.get(id).then(function(doc){
                return db.remove(doc);
            }).then(function(){
                $('#'+id).parent().remove();
                socket.emit('deleteagu', {id: id, location: locationNumber, player: playerNumber});
            });
        },

        addVote: function(){
            if(!locationNumber){
                $('#chooseLocationDlg').dialog('open');
                input.rating("update", 0);
                return;
            }
//            $( "#voteConfirm" ).dialog( "open");
            var input = $("#input");
            var value = input.val();
            var id = 'vote_' + groupNumber + '_' + locationNumber + '_' + playerNumber;
            Client.newVote(value, id, 5, input);
        },
//
//        confirmVote: function(){
//            var input = $("#input");
//            var value = input.val();
//            var id = 'vote_' + groupNumber + '_' + locationNumber + '_' + playerNumber;
//            Client.newVote(value, id, 5, input);
//        },

        newVote: function(value, id, trials, input){
            db.upsert(id, function(doc){
                var flag = doc.flag?doc.flag:0;
                flag++;
                return{
                    "type": "vote",
                    "group": groupNumber,
                    "location": locationNumber,
                    "player": playerNumber,
                    "vote": value,
                    "flag": flag,
                    "timestamp": new Date().getTime()
                }
            }).then(function() {
                db.get(id).then(function(){
                    $('#submitVote').prop("disabled", true);
//                    input.rating("refresh", {disabled: true, showClear: false});
                    socket.emit('vote', {location: locationNumber, group: groupNumber, player: playerNumber, value:value, id: id});
                }).catch(function (error) {
                    console.log(error);
                    if (trials > 0){
                        newVote(value,id, trials--);
                    }
                })
            });
        }
    };

    Client.init();

});