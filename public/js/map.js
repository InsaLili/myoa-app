/**
 * Created by Lili on 08/04/15.
 */

// DOM Ready =============================================================
$(document).ready(function() {
    $(document).on('contextmenu', function() {
        return false;
    });
    var socket = io.connect('http://localhost:8000');
    var groupNumber = 0;
    var allRating = 0;
    var chosenNumber = 0;
    var aguFlag = false;
    var stepNumber = 1;
    var white= '#E0E0E0';

    var Server={
        init: function(){
            Server.domInit();
            Server.dialogInit();
            Server.serviceInit();
        },

        domInit: function(){

            // $('#finalStepBtn').on('click',function(){
            //     $(this).prop('disabled', true);
            //     $('#finalDialog').dialog('open');
            // });
            // $('#finalStepBtn').prop('disabled', true);

            // $('#step1 p').css('color', white);
            // $('#step1 span').css('color', white);

            // $('.visualPlayer').hide();

                // Server.attachNotes();
                // Server.attachRating();

            $('#step1 span').on('click', function(){
                if(stepNumber==1 && allRating==3){
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

        dialogInit: function(){
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
                    $(progressbarText[j-1]).text(rating[j-1] + '/'+locationAmount+' Emplacements');
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
            // $('#step2').css('color', white);

            $('.chooseLocation').show();

            Server.attachVotes();
            $('#timer2').countdown({
                image: "/img/digits.png",
                format: "mm:ss",
                startTime: "05:00"
            });
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
});

