//App.js

//declare modules
var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var filename = path.join(__dirname, 'debug.log');
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({'timestamp':true}),
        new (winston.transports.File)({ filename: filename })
    ]
});

var app = express();
var routes = require('./routes/index');

//set express environment
app.engine('.html', require('ejs').__express);
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: false} ));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

//http server
var httpserver = http.createServer(app);
httpserver.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

//socket
var io = require('socket.io')(httpserver);
io.on('connection', function (socket) {
    console.log("a new device is connected");
    var agree = [];
    socket.on('choosegroup', function(data){
        // logger.info('choose the group',data);
        logger.info('choose the group',data);
        groupNum = data.group;
    });
    socket.on('addcri', function(data){
        console.log('add a criteria',data);
        io.emit('agreecri', data);
    });
    socket.on('confirmcri', function(data){
        console.log('agree with criteria', agree);
        (agree[data.group] == undefined)?(agree[data.group]=1):(agree[data.group]++);
        if(agree[data.group] == data.playeramount){
            io.emit('successcri');
            agree[data.group]=0;
        }
    })
    socket.on('deletecri', function(data){
        console.log('delete a criteria',data);
        // logger.log('info',data);
        io.emit('deletecri', data);
    });
    socket.on('changestep', function(data){
        console.log('change step',data);
        // logger.log('info',data);
        io.emit('changestep', data);
    })
    // Start listening for mouse events
    socket.on('checklocation', function (data) {
        console.log('check the location',data);
//        io.emit send message to all clients，socket.emit send message to particular client
        var numLocation = data.location-1;
        io.emit('checklocation', data);
    });

    socket.on('confirmlocation', function(data){
        console.log('confirm the location',data);
        io.emit('confirmlocation',data);
    });
    socket.on('addlocalnote', function(data){
        console.log('add local note',data);
        io.emit('addlocalnote', data);
    });
    socket.on('addcommonnote', function(data){
        console.log('add common note',data);
        io.emit('addcommonnote', data);
    });
    socket.on('deletelocalnote', function(data){
        console.log('delete local note',data);
        io.emit('deletelocalnote', data);
    });
    socket.on('deletecommonnote', function(data){
        console.log("delete common note",data);
        io.emit('deletecommonnote', data);
    });

    socket.on('evaluate', function(data){
        console.log('evaluate the location',data);
        io.emit('evaluate', data);
    }); 

    socket.on('evalonshare', function(data){
        console.log('evaluate the location on the shared display',data);
        io.emit('evalonshare', data);
    });
});


