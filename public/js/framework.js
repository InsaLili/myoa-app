/**
 * Created by Lili on 12/11/15.
 */
$(document).ready(function() {
    var db = new PouchDB('http://localhost:5984/insect');
    db.allDocs({
        include_docs: true,
        attachements: true,
        startkey: 'location',
        endkey: 'location\uffff'
    }).then(function (locationData) {
        var amountDB = locationData.rows.length;
        // store data into locations
        var locations = [];
        for (var i = 0; i < amountDB; i++) {
            var currentLocation = {};
            currentLocation.name = locationData.rows[i].doc.name;
            currentLocation.long = Number(locationData.rows[i].doc.long);
            currentLocation.lati = Number(locationData.rows[i].doc.lati);
            currentLocation.data = locationData.rows[i].doc.data;
            currentLocation.number = locationData.rows[i].doc.number;
            currentLocation.title = "location"+locationData.rows[i].doc.number;
            currentLocation.state = "Edit";
            locations.push(currentLocation);
        }

        var upload = function() {
            var currentLocation = octopus.locations[octopus.locationAmount - 1];
            var id = "location" + currentLocation.number;
            this.db.upsert(id, function (doc) {
                return{
                    "number": currentLocation.number,
                    "name": currentLocation.name,
                    "long": currentLocation.long,
                    "lati": currentLocation.lati,
                    "data": currentLocation.data
                }
            });
         };

        // connection between view and model
        var octopus = function () {
            var self = this;
            self.locationList = ko.observableArray(locations);
            self.locationAmount = ko.observable(amountDB);
            self.currentLocation = ko.observable(0);
///           self.updateBtnVal();

            // set addLocation button value. If there are former location, button value=number(last)+1. If not, button value=1
            self.updateBtnVal = function () {
                var self = this;
                var amount = self.locationAmount;
                if (amount >= 1) {
                    $('#addLocation').val(self.locations[amount - 1].number + 1);
                } else {
                    $('#addLocation').val(1);
                }
            };

            self.addLocation = function (location) {
                var self = this;
                var currentLocation = {};
                currentLocation.name = $(location).find('.location-name').val();
                currentLocation.long = $(location).find('.location-long').val();
                currentLocation.lati = $(location).find('.location-lati').val();
                currentLocation.data = $(location).find('.location-data').val();
                currentLocation.number = Number($(location).find('button').val());
                self.locations.push(currentLocation);
                self.locationAmount++;
                model.upload();
            };

            self.editLocation = function (location, event) {
                self.currentLocation(location);
                var state = location.state;
                if (state == "Edit") {
                    location.state = "Save";
                    current.find("input").prop('disabled', false);
                    button.name = "save";
                } else {
                    location.state = "Edit";
                    current.find("input").prop('disabled', true);
                    button.name = "edit";
//                    self.addLocation(current);
                }
            };

            self.renderLocation = function () {
                var self = this;
                self.updateBtnVal();
            }
        };
        ko.applyBindings(new octopus(), document.getElementById("locations"));
    });
});

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

    // initiate render, show all the former location data. Only be executed once
//        render: function(){
//            var locations = octopus.locations;
//            for(var i=0; i<octopus.locationAmount;i++){
//                var location = locations[i];
//                var text = '<div id="location'+location.number+'">';
//                text += '<h3>Location'+location.number+'</h3>';
//                text += '<div class="form-group"><label>Longitude:</label><input class="location-long form-control" type="text" name="longitude" disabled="disabled" value="'+location.long+'"></div>';
//                text += '<div class="form-group"><label>Latitude:</label><input class="location-lati form-control" type="text" name="latitude" disabled="disabled" value="'+location.lati+'"></div>';
//                text += '<div class="form-group"><label>Name:</label><input class="location-name form-control" type="text" name="name" disabled="disabled" value="'+location.name+'"></div>';
//                text += '<div class="form-group"><label>Data:</label><textarea class="location-data form-control" type="text" name="data" disabled="disabled" value="'+location.data+'"></textarea></div>';
//                text += '<button class="editBtn btn btn-default" name="edit" value='+location.number+'>Edit</button></div>';
//                $('#locations').append(text);
//            }
//            $('#locations').on('click', '.editBtn',function(){
//                octopus.editLocation(this);
//            });
//        },

//        // when a new location has been added, render it on the page
//        renderNew: function(){
//            var currentLocation = octopus.locations[octopus.locationAmount-1];
//            var text = '<div id="location'+currentLocation.number+'">';
//            text += '<h3>Location'+currentLocation.number+'</h3>';
//            text += 'Longitude: <input class="location-long" type="text" name="longitude" disabled="disabled" value="'+currentLocation.long+'">';
//            text += 'Latitude: <input class="location-lati" type="text" name="latitude" disabled="disabled" value="'+currentLocation.lati+'">';
//            text += 'Name: <input class="location-name" type="text" name="name" disabled="disabled" value="'+currentLocation.name+'">';
//            text += 'Data: <input class="location-data" type="text" name="data" disabled="disabled" value="'+currentLocation.data+'">';
//            text += '<button class="editBtn btn" name="edit" value='+currentLocation.number+'>Edit</button></div>';
//            $('#locations').append(text);
//        }
    // initiate, get former location data from database, execute once
//    getLocations: function(){
//        var self = this;
//        self.db.allDocs({
//            include_docs: true,
//            attachements: true,
//            startkey: 'location',
//            endkey: 'location\uffff'
//        }).then(function(locationData){
//            model.locationAmountDB = locationData.rows.length;
//            // store data into model.locations
//            for(var i = 0; i < model.locationAmountDB; i++){
//                var currentLocation = {};
//                currentLocation.name = locationData.rows[i].doc.name;
//                currentLocation.long = Number(locationData.rows[i].doc.long);
//                currentLocation.lati = Number(locationData.rows[i].doc.lati);
//                currentLocation.data = locationData.rows[i].doc.data;
//                currentLocation.number = locationData.rows[i].doc.number;
//                model.locationsDB.push(currentLocation);
//            }
//
//            //octopus init
//            octopus.init();
//        });
//    },
//});

//
//var view = {
//    // view init, set button event
//    init: function(){
//        this.addLocationBtn = $('#addLocation');
//        this.addLocationBtn.on('click', function(){
//            octopus.addLocation(this.parentNode);
//            octopus.renderLocation();
//        });
//
//        this.render();
//    }
//};