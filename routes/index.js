/**
 * Created by Lili on 09/04/15.
 */
/* GET Userlist page. */

var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Map' });
});

router.get('/player', function(req, res){
    res.render('player', {});
});

router.get('/framework', function(req, res){
    res.render('framework', {});
});

router.get('/upload', function(req, res){
});

module.exports = router;

