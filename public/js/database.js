$(document).ready(function() {
var db = new PouchDB('http://localhost:5984/framework');

    // db.put(data);

    // db.put({
    //   _id: 'mydoc',
    //   title: 'Heroes'
    // }).then(function (response) {
    //   // handle response
    // }).catch(function (err) {
    //   console.log(err);
    // });

    // console.log(data.markers);
    // // var mydoc = JSON.parse(data);
    // db.get('mapsetting').then(function(doc) {
    //   return db.remove(doc);
    // }).then(function (result) {
    //   // handle result
    //   db.put(data);
    // }).catch(function (err) {
    //   console.log(err);
    // });
})