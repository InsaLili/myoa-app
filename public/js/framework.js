/**
 * Created by Lili on 12/11/15.
 */
$(document).ready(function() {
    var view = {
        init: function(){
            this.addLocationBtn = $('#addLocation');
            this.addLocationBtn.on('click', function(){
                octopus.addLocation(this.parentNode);
            });

            this.render();
        },
        render: function(){
            var locations = octopus.storeLocations();
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
            $('.editBtn').on('click', function(){
                octopus.editLocation(this);
            });
        }
    };

    var model = {
        locations: [{},{},{}],
        init: function(){
            this.db = new PouchDB('http://localhost:5984/insect');
            this.getLocations();
        },

        getLocations: function(){
            this.db.allDocs({
                include_docs: true,
                attachements: true,
                startkey: 'location',
                endkey: 'location\uffff'
            }).then(function(locationData){
                model.locationAmount = locationData.rows.length;
                for(var i = 0; i < model.locationAmount; i++){
                    model.locations[i].name = locationData.rows[i].doc.name;
                    model.locations[i].long = Number(locationData.rows[i].doc.long);
                    model.locations[i].lati = Number(locationData.rows[i].doc.lati);
                    model.locations[i].data = locationData.rows[i].doc.data;
                    model.locations[i].number = locationData.rows[i].doc.number;
                }
                if(model.locationAmount>=1){
                    $('#addLocation').val(model.locations[i-1].number+1);
                }else{
                    $('#addLocation').val(1);
                }
                octopus.init();
            });
        },

        upload: function(){
            var id = "location"+octopus.locationNumber;
            this.db.upsert(id, function(doc){
                return{
                    "number": octopus.locationNumber,
                    "name": octopus.locationName,
                    "long": octopus.locationLong,
                    "lati": octopus.locationLati,
                    "data": octopus.locationData
                }
            });
        }
    };

    var octopus = {
        init: function(){
            view.init();
        },

        storeLocations: function(){
            octopus.locationAmount = model.locationAmount;
            return model.locations;
        },

        addLocation: function(location){
            this.locationName = $(location).find('.location-name').val();
            this.locationLong = $(location).find('.location-long').val();
            this.locationLati = $(location).find('.location-lati').val();
            this.locationData = $(location).find('.location-data').val();
            this.locationNumber = Number($(location).find('button').val());
            model.upload();
            view.render();
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