/**
 * Created by Lili on 09/04/15.
 */
/* GET Userlist page. */

var express = require('express');
var router = express.Router();
var PouchDB = require('pouchdb');
//store the average of each group
var group1 = [];
var group2 = [];
var group3 = [];
var group4 = [];
//store all groups' averages
var allData = [];
//flag of how many groups update data
var allGroupNum = [0,0,0,0];
// var db = new PouchDB('http://localhost:5984/insect');
var db = new PouchDB('http://localhost:5984/insect');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Map' });
});

router.get('/player', function(req, res){
    res.render('player', {});
});

router.get('/upload', function(req, res){
});

module.exports = router;

