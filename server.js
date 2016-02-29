//requires
var global = require('./globals.js');
var f = require('./functions.js');
var express = require('express'); 
var clc = require('cli-color'); //pretty colors in the server logging

var app = express();
var http = require('http');
var os = require('os');
var path = require('path');
var uuid = require('node-uuid');
var fs = require('fs');
var Busboy = require('busboy'); //for file upload server



//app.get('/', function(req,res) {
    app.use(express.static('sengine'));
//})

//server for clients
var server = http.createServer(app).listen(8000, function() {
    console.log(clc.whiteBright.bgCyan("client message server listening on port 8000..."));
});
var io = require('socket.io').listen(server);

//server for client file upload
http.createServer(function(req, res) {
  if (req.method === 'POST') {
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var split = filename.split('.');
        var ext = split[split.length - 1];
        var tempFilename = uuid.v4({rng: uuid.mathRNG}) + '.' + ext;
        var saveTo = path.join(__dirname, 'tmp', path.basename(tempFilename));
        console.log(saveTo);
        file.pipe(fs.createWriteStream(saveTo));
    });
    busboy.on('finish', function() {
      res.writeHead(200, { 'Connection': 'close' });
      res.end("That's all folks!");
    });
    return req.pipe(busboy);
  }
  res.writeHead(404);
  res.end();
}).listen(8002, function() {
  console.log(clc.whiteBright.bgYellow("file upload server listening on port 8002..."));
});

//server for sound engine
var sese = require('http').createServer(app).listen(8001, function() {
    console.log(clc.whiteBright.bgBlack("sound engine server listening on port 8001..."));
});
var iose = require('socket.io').listen(sese);

//vars
var clientCount = 0;
var soundEngine; //this will hold the reference to the sound engine. Need to define here so it has proper scope.
var soundEngineManifestLength = 0;

global.VALID_COMMANDS = {
    play    : true,
    loop    : true,
    stop    : true,
    pause   : true,
    vol     : true,
    pan     : true
}

//nickname tracking
var nicksDirMap = {}; //hash table
var nicksTaken = {};

//sound engine communication
iose.sockets.on('connection', function (client) {
    console.log(clc.whiteBright.bgBlack("sound engine connected"));
    console.log(clc.whiteBright.bgBlack("sound engine socket id: " + client.id));
    soundEngine = client;

    soundEngine.on('disconnect', function (client) {
        console.log("sound engine disconnected");
        soundEngine = undefined;
    });

    soundEngine.on('message', function(data) {
    //when the sound engine sends a message to here
        console.log("SENGINE says: " + data.msg);
    });

    soundEngine.on('manifestUpdate', function(data) {
        console.log("SENGINE says manifest length = " + data);
        soundEngineManifestLength = data;
    })
});


//client communication
io.sockets.on('connection', function (client) {
    client.emit('connection');

    //nickname events
    client.on('nick', function(name){
        //is the nick available?
        if (!nicksTaken[name]) {
            nicksTaken[name] = true;
            nicksDirMap[client.id] = name;
        }
        else {
            //not available, let client know
            client.emit('nickTaken', name);
        }
        console.log(nicksDirMap);
    });

    //message events
    client.on('message', function(msg) {
        //when any chat client sends a message to here

        if (typeof(soundEngine) === 'undefined') {
            //sound engine is not connected. Let user know.
            console.log("command received from client, but sEngine is not connected");
            client.emit('message', "Server received your command, but the sound engine is not connected");
            return false;
        }

        //parse out the message to see if its valid
        var result = f.cmdCheck(msg);

        if (typeof(result) !== 'boolean') {
        //only continue if command was valid

            //only continue if sound id is valid
            if (result['id'] > soundEngineManifestLength - 1) {
                client.emit('message', "Server received your command, but the sound id is invalid");
                return false;
            }

            //send command to sound engine. Ideally should have a callback
            soundEngine.emit(
                'command', 
                { 
                    cmd: result['cmd'],
                    id: result['id'],
                    val: result['val']
                },
                function(result){
                    //callback
                   if (result) {
                        //if sound played successfully, let the world know it happened
                        console.log("broadcasting " + msg);
                        client.emit('message', msg);
                        client.broadcast.send(msg);      
                    }              
                }
            );
        }
    });
    client.on('disconnect', function(){
        console.log("client " + client.id + " disconnected");
         nicksTaken[nicksDirMap[client.id]] = false;
         nicksDirMap[client.id] = null;
         updateNumClients(false);
    });

    updateNumClients(true);
});

//LOGGING
function serverLog(type, msg) {

}

function updateNumClients(connected) {
    if (connected) {
        clientCount ++;
    }
    else {
        clientCount --;
    }
    console.log (clc.whiteBright.bgCyan("chat client count: " + clientCount));
    console.log(nicksDirMap);
};