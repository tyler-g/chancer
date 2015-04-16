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

global.VALID_COMMANDS = {
    play    : true,
    loop    : true,
    stop    : true,
    pause   : true,
    vol     : true,
    pan     : true
}

//sound engine communication
iose.sockets.on('connection', function (client) {
    console.log(clc.whiteBright.bgBlack("sound engine connected"));
    console.log(clc.whiteBright.bgBlack("sound engine socket id: " + client.id));
    soundEngine = client;

    client.on('disconnect', function (client) {
        console.log("sound engine disconnected");
        soundEngine = undefined;
    });

    client.on('message', function(data) {
    //when the sound engine sends a message to here
        console.log(data);
        console.log("got a message from sound engine!");
    });
});


//client communication
io.sockets.on('connection', function (client) {

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
        console.log(result);

		if (typeof(result) !== 'boolean') {
			//only continue if command was valid
            console.log(soundEngine);
			//send command to sound engine. Ideally should have a callback
            soundEngine.emit('command', { 
                cmd: result['cmd'],
                id: result['id'],
                val: result['val']
            });

			console.log("broadcasting " + msg);
        	client.emit('message', msg);
    	}
    });
    client.on('disconnect', function(client){
    	console.log("client disconnected");
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
};
