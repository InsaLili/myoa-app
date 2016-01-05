$(document).ready(function() {
var db = new PouchDB('http://localhost:5984/insect');

    db.allDocs({
        include_docs: true,
        attachements: true,
        startkey: 'note',
        endkey: 'note\uffff'
    }).then(function(notes){
        for(var i=0; i < notes.rows.length; i++){
            db.remove(notes.rows[i].doc);
        }
    });
    db.allDocs({
        include_docs: true,
        attachements: true,
        startkey: 'vote',
        endkey: 'vote\uffff'
    }).then(function(notes){
        for(var i=0; i < notes.rows.length; i++){
            db.remove(notes.rows[i].doc);
        }
    });

// db.put({
//         _id: "measure/1/1",
//         "group": 1,
//         "location":1,
//         "Light": "987Lux",
//         "PH": "10mg/L",
//         "Temperature": "11.2°C",
//         "Wind": "0.0km/h"
// });

// db.put({
//         _id: "measure/1/2",
//         group: 1,
//         location:2,
//         Light: "1293Lux",
//         PH: "15mg/L",
//         Temperature: "14.2°C",
//         Wind: "4.5km/h"
// });

// db.put({
//         _id: "measure/1/3",
//         group: 1,
//         location:3,
//         Light: "240Lux",
//         PH: "25mg/L",
//         Temperature: "12.3°C",
//         Wind: "0km/h"
// });

// db.put({
//         _id: "measure/1/4",
//         group: 1,
//         location:4,
//         Light: "8574Lux",
//         PH: "25mg/L",
//         Temperature: "20.1°C",
//         Wind: "2.1km/h"
// });

// db.put({
//         _id: "measure/1/5",
//         group: 1,
//         location:5,
//         Light: "3500Lux",
//         PH: "40mg/L",
//         Temperature: "18.5°C",
//         Wind: "4.5km/h"
// });

// db.put({
//         _id: "measure/1/6",
//         group: 1,
//         location:6,
//         Light: "4230Lux",
//         PH: "35mg/L",
//         Temperature: "17.5°C",
//         Wind: "4.2km/h"
// });

// db.put({
//         _id: "measure/1/7",
//         group: 1,
//         location:7,
//         Light: "5138Lux",
//         PH: "50mg/L",
//         Temperature: "15.1°C",
//         Wind: "2.0km/h"
// });

// db.put({
//         _id: "measure/1/8",
//         group: 1,
//         location:8,
//         Light: "8573Lux",
//         PH: "30mg/L",
//         Temperature: "17.3°C",
//         Wind: "1.1km/h"
// });


// db.put({
//         _id: "measure/2/1",
//         group: 2,
//         location:1,
//         Light: "957Lux",
//         PH: "10mg/L",
//         Temperature: "13.2°C",
//         Wind: "0.2km/h"
// });

// db.put({
//         _id: "measure/2/2",
//         group: 2,
//         location:2,
//         Light: "1492Lux",
//         PH: "10mg/L",
//         Temperature: "13.9°C",
//         Wind: "8.3km/h"
// });

// db.put({
//         _id: "measure/2/3",
//         group: 2,
//         location:3,
//         Light: "125Lux",
//         PH: "30mg/L",
//         Temperature: "13.1°C",
//         Wind: "0.1km/h"
// });

// db.put({
//         _id: "measure/2/4",
//         group: 2,
//         location:4,
//         Light: "25349Lux",
//         PH: "30mg/L",
//         Temperature: "19.3°C",
//         Wind: "3.1km/h"
// });

// db.put({
//         _id: "measure/2/5",
//         group: 2,
//         location:5,
//         Light: "4753Lux",
//         PH: "35mg/L",
//         Temperature: "18.3°C",
//         Wind: "4.3km/h"
// });

// db.put({
//         _id: "measure/2/6",
//         group: 2,
//         location:6,
//         Light: "4588Lux",
//         PH: "35mg/L",
//         Temperature: "17.1°C",
//         Wind: "3.2km/h"
// });

// db.put({
//         _id: "measure/2/7",
//         group: 2,
//         location:7,
//         Light: "5289Lux",
//         PH: "50mg/L",
//         Temperature: "14.3°C",
//         Wind: "1.1km/h"
// });

// db.put({
//         _id: "measure/2/8",
//         group: 2,
//         location:8,
//         Light: "5322Lux",
//         PH: "25mg/L",
//         Temperature: "18.1°C",
//         Wind: "0.5km/h"
// });


// db.put({
//         _id: "measure/3/1",
//         group: 3,
//         location:1,
//         Light: "942Lux",
//         PH: "20mg/L",
//         Temperature: "12.4°C",
//         Wind: "0.3km/h"
// });

// db.put({
//         _id: "measure/3/2",
//         group: 3,
//         location:2,
//         Light: "1391Lux",
//         PH: "15mg/L",
//         Temperature: "13.6°C",
//         Wind: "3.4km/h"
// });

// db.put({
//         _id: "measure/3/3",
//         group: 3,
//         location:3,
//         Light: "157Lux",
//         PH: "50mg/L",
//         Temperature: "11.7°C",
//         Wind: "0.0km/h"
// });

// db.put({
//         _id: "measure/3/4",
//         group: 3,
//         location:4,
//         Light: "21893Lux",
//         PH: "20mg/L",
//         Temperature: "19.2°C",
//         Wind: "3.2km/h"
// });

// db.put({
//         _id: "measure/3/5",
//         group: 3,
//         location:5,
//         Light: "3788Lux",
//         PH: "40mg/L",
//         Temperature: "20.2°C",
//         Wind: "3.7km/h"
// });

// db.put({
//         _id: "measure/3/6",
//         group: 3,
//         location:6,
//         Light: "3782Lux",
//         PH: "40mg/L",
//         Temperature: "18.5°C",
//         Wind: "3.0km/h"
// });

// db.put({
//         _id: "measure/3/7",
//         group: 3,
//         location:7,
//         Light: "5038Lux",
//         PH: "75mg/L",
//         Temperature: "14.5°C",
//         Wind: "0.3km/h"
// });

// db.put({
//         _id: "measure/3/8",
//         group: 3,
//         location:8,
//         Light: "9843Lux",
//         PH: "10mg/L",
//         Temperature: "18.5°C",
//         Wind: "0.0km/h"
// });


// db.put({
//         _id: "measure/4/1",
//         group: 4,
//         location:1,
//         Light: "849Lux",
//         PH: "15mg/L",
//         Temperature: "11.9°C",
//         Wind: "0.1km/h"
// });

// db.put({
//         _id: "measure/4/2",
//         group: 4,
//         location:2,
//         Light: "1309Lux",
//         PH: "15mg/L",
//         Temperature: "14.1°C",
//         Wind: "6.2km/h"
// });

// db.put({
//         _id: "measure/4/3",
//         group: 4,
//         location:3,
//         Light: "231Lux",
//         PH: "20mg/L",
//         Temperature: "14.0°C",
//         Wind: "0.5km/h"
// });

// db.put({
//         _id: "measure/4/4",
//         group: 4,
//         location:4,
//         Light: "12938Lux",
//         PH: "10mg/L",
//         Temperature: "21.3°C",
//         Wind: "1.4km/h"
// });

// db.put({
//         _id: "measure/4/5",
//         group: 4,
//         location:5,
//         Light: "4293Lux",
//         PH: "40mg/L",
//         Temperature: "19.1°C",
//         Wind: "2.8km/h"
// });

// db.put({
//         _id: "measure/4/6",
//         group: 4,
//         location:6,
//         Light: "4019Lux",
//         PH: "35mg/L",
//         Temperature: "19.3°C",
//         Wind: "3.1km/h"
// });

// db.put({
//         _id: "measure/4/7",
//         group: 4,
//         location:7,
//         Light: "4975Lux",
//         PH: "50mg/L",
//         Temperature: "13.1°C",
//         Wind: "1.3km/h"
// });

// db.put({
//         _id: "measure/4/8",
//         group: 4,
//         location:8,
//         Light: "4923Lux",
//         PH: "10mg/L",
//         Temperature: "18.3°C",
//         Wind: "0.3km/h"
// });


// db.put({
//         group: 5,
//         location:1,
//         Light: "Lux",
//         PH: "mg/L",
//         Temperature: "°C",
//         Wind: "km/h"
// });

// db.put({
//         group: 5,
//         location:2,
//         Light: "Lux",
//         PH: "mg/L",
//         Temperature: "°C",
//         Wind: "km/h"
// });

// db.put({
//         group: 5,
//         location:3,
//         Light: "Lux",
//         PH: "mg/L",
//         Temperature: "°C",
//         Wind: "km/h"
// });

// db.put({
//         group: 5,
//         location:4,
//         Light: "Lux",
//         PH: "mg/L",
//         Temperature: "°C",
//         Wind: "km/h"
// });

// db.put({
//         group: 5,
//         location:5,
//         Light: "Lux",
//         PH: "mg/L",
//         Temperature: "°C",
//         Wind: "km/h"
// });

// db.put({
//         group: 5,
//         location:6,
//         Light: "Lux",
//         PH: "mg/L",
//         Temperature: "°C",
//         Wind: "km/h"
// });

// db.put({
//         group: 5,
//         location:7,
//         Light: "Lux",
//         PH: "mg/L",
//         Temperature: "°C",
//         Wind: "km/h"
// });

// db.put({
//         group: 5,
//         location:8,
//         Light: "Lux",
//         PH: "mg/L",
//         Temperature: "°C",
//         Wind: "km/h"
// });


// db.allDocs({
//    include_docs: true,
//    attachements: true,
//    startkey: 'agu',
//    endkey: 'agu\uffff'
// }).then(function(notes){
//    for(var i=0; i < notes.rows.length; i++){
//        db.remove(notes.rows[i].doc);
//    }
// });
// db.allDocs({
//    include_docs: true,
//    attachements: true,
//    startkey: 'vote',
//    endkey: 'vote\uffff'
// }).then(function(notes){
//    for(var i=0; i < notes.rows.length; i++){
//        db.remove(notes.rows[i].doc);
//    }
// });

// // average
// db.allDocs({
//    include_docs: true,
//    attachements: true,
//    startkey: 'measure',
//    endkey: 'measure/4\uffff'
// }).then(function(locationData){
//    var locationNum = 1;
//    var light=0;
//    var wind=0;
//    var tem=0;
//    var ph=0;
//    for(var i = 0; i < locationData.rows.length; i++){
//        var number = locationData.rows[i].doc.location;
//        if(number == locationNum){
//            var oneLocationData = locationData.rows[i].doc;
//            light += parseFloat(oneLocationData.Light);
//            wind += parseFloat(oneLocationData.Wind);
//            tem += parseFloat(oneLocationData.Temperature);
//            ph += parseFloat(oneLocationData.PH);
//            console.log(light);
//        }
//    }
//    light  = light/4;
//    light = Math.round(light)+'Lux';
//    wind = (wind/4).toFixed(1)+'km/h';
//    tem = (tem/4).toFixed(1)+'°C';
//    ph = (ph/4).toFixed(1)+'mg/L';
//    db.get('measure/5/'+locationNum).then(function(doc) {
//        console.log('average');
//        console.log(light);
//        return db.put({
//            group: 5,
//            location: locationNum,
//            Light: light,
//            Wind: "km/h"wind,
//            Temperature: tem,
//            PH: ph
//        }, 'measure/5/'+locationNum, doc._rev);
//    });
// // });
// db.allDocs({
//    include_docs: true,
//    attachements: true,
//    startkey: 'measure',
//    endkey: 'measure/4\uffff'
// }).then(function(locationData){
//    var locationNum = 8;
//    var light=0;
//    var wind=0;
//    var tem=0;
//    var ph=0;
//    for(var i = 0; i < locationData.rows.length; i++){
//        var number = locationData.rows[i].doc.location;
//        if(number == locationNum){
//            var oneLocationData = locationData.rows[i].doc;
//            light += parseFloat(oneLocationData.Light);
//            wind += parseFloat(oneLocationData.Wind);
//            tem += parseFloat(oneLocationData.Temperature);
//            ph += parseFloat(oneLocationData.PH);
//            console.log(light);
//        }
//    }
//    light  = light/4;
//    light = Math.round(light)+'Lux';
//    wind = (wind/4).toFixed(1)+'km/h';
//    tem = (tem/4).toFixed(1)+'°C';
//    ph = (ph/4).toFixed(1)+'mg/L';
//     db.put({
//         _id: "measure/5/"+locationNum,
//            group: 5,
//            location: locationNum,
//            Light: light,
//            Wind: wind,
//            Temperature: tem,
//            PH: ph
//        });
// });

})