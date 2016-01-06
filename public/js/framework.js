/**
 * Created by Lili on 12/11/15.
 */
$(document).ready(function() {
    var view = {
        // view init, set button event
        init: function(){
            this.addLocationBtn = $('#addLocation');
            this.addLocationBtn.on('click', function(){
                octopus.addLocation(this.parentNode);
                octopus.renderLocation();
            });

            this.render();
        },

        // initiate render, show all the former location data. Only be executed once
        render: function(){
            var locations = octopus.locations;
            for(var i=0; i<octopus.locationAmount;i++){
                var location = locations[i];
                var text = '<div id="location'+location.number+'">';
                text += '<h3>Location'+location.number+'</h3>';
                text += 'Longitude: <input class="location-long" type="text" name="longitude" disabled="disabled" value="'+location.long+'">';
                text += 'Latitude: <input class="location-lati" type="text" name="latitude" disabled="disabled" value="'+location.lati+'">';
                text += 'Name: <input class="location-name" type="text" name="name" disabled="disabled" value="'+location.name+'">';
                text += 'Data: <input class="location-data" type="text" name="data" disabled="disabled" value="'+location.data+'">';
                text += '<button class="editBtn btn" name="edit" value='+location.number+'>Edit</button></div>';
                $('#locations').append(text);
            }
            $('#locations').on('click', '.editBtn',function(){
                octopus.editLocation(this);
            });
        },

        // when a new location has been added, render it on the page
        renderNew: function(){
            var currentLocation = octopus.locations[octopus.locationAmount-1];
            var text = '<div id="location'+currentLocation.number+'">';
            text += '<h3>Location'+currentLocation.number+'</h3>';
            text += 'Longitude: <input class="location-long" type="text" name="longitude" disabled="disabled" value="'+currentLocation.long+'">';
            text += 'Latitude: <input class="location-lati" type="text" name="latitude" disabled="disabled" value="'+currentLocation.lati+'">';
            text += 'Name: <input class="location-name" type="text" name="name" disabled="disabled" value="'+currentLocation.name+'">';
            text += 'Data: <input class="location-data" type="text" name="data" disabled="disabled" value="'+currentLocation.data+'">';
            text += '<button class="editBtn btn" name="edit" value='+currentLocation.number+'>Edit</button></div>';
            $('#locations').append(text);
        }
    };

    var model = {

        // model init, database init
        init: function(){
            this.locationsDB = [];
            this.locationAmountDB = null;
            this.db = new PouchDB('http://localhost:5984/insect');
            this.getLocations();
        },

        // initiate, get former location data from database, execute once
        getLocations: function(){
            this.db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: 'location',
                endkey: 'location\uffff'
            }).then(function(locationData){
                model.locationAmountDB = locationData.rows.length;
                // store data into model.locations
                for(var i = 0; i < model.locationAmountDB; i++){
                    var currentLocation = {};
                    currentLocation.name = locationData.rows[i].doc.name;
                    currentLocation.long = Number(locationData.rows[i].doc.long);
                    currentLocation.lati = Number(locationData.rows[i].doc.lati);
                    currentLocation.data = locationData.rows[i].doc.data;
                    currentLocation.number = locationData.rows[i].doc.number;
                    model.locationsDB.push(currentLocation);
                }

                //octopus init
                octopus.init();
            });
        },

        // put data into database
        upload: function(){
            var currentLocation = octopus.locations[octopus.locationAmount-1];
            var id = "location"+currentLocation.number;
            this.db.upsert(id, function(doc){
                return{
                    "number": currentLocation.number,
                    "name": currentLocation.name,
                    "long": currentLocation.long,
                    "lati": currentLocation.lati,
                    "data": currentLocation.data
                }
            });
        }
    };

    // connection between view and model
    var octopus = {
        init: function(){
            this.locations = model.locationsDB;
            this.locationAmount = model.locationAmountDB;
            view.init();
            this.updateBtnVal();
        },

        // set addLocation button value. If there are former location, button value=number(last)+1. If not, button value=1
        updateBtnVal: function(){
            var amount = this.locationAmount;
            if(amount>=1){
                $('#addLocation').val(this.locations[amount-1].number+1);
            }else{
                $('#addLocation').val(1);
            }
        },

        addLocation: function(location){
            var currentLocation = {};
            currentLocation.name = $(location).find('.location-name').val();
            currentLocation.long = $(location).find('.location-long').val();
            currentLocation.lati = $(location).find('.location-lati').val();
            currentLocation.data = $(location).find('.location-data').val();
            currentLocation.number = Number($(location).find('button').val());
            this.locations.push(currentLocation);
            this.locationAmount++;
            model.upload();
        },

        editLocation: function(button){
            var value = button.name;
            var current = $(button.parentNode);
            if(value == "edit"){
                button.textContent = "Save";
                current.children("input").prop('disabled', false);
                button.name = "save";
            }else{
                button.textContent = "Edit";
                current.children("input").prop('disabled', true);
                button.name = "edit";
                this.addLocation(current);
            }

        },

        renderLocation: function(){
            view.renderNew();
            this.updateBtnVal();
        }
    };

    model.init();
//    db.upsert(id[0], function(doc){
//        return{
//            "number": 1,
//            "type": "location",
//            "name": "1. Balcon sur la cascade",
//            "long": "5.892298",
//            "lait":"45.395142",
//            "data": "there are the data of location1"
//        }
//    });
//    db.upsert(id[1], function(doc){
//        return{
//            "number": 2,
//            "type": "location",
//            "name": "2. Sous les embruns",
//            "long": "5.891826",
//            "lait":"45.391789",
//            "data": "there are the data of location2"
//        }
//    });
//    db.upsert(id[2], function(doc){
//        return{
//            "number": 3,
//            "type": "location",
//            "name": "3. Au détour du sentier",
//            "long": "5.888789",
//            "lait":"45.394547",
//            "data": "here are the data of location3"
//        }
//    });
//    db.upsert(id[3], function(doc){
//        return{
//            "number": 4,
//            "type": "location",
//            "name": "4. La clairière",
//            "long": "5.890012",
//            "lait":"45.398352",
//            "data": "here are the data of location4"
//        }
//    });
});