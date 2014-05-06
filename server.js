//requires
var global = require('./globals.js');
var f = require('./functions.js');
var express = require('express'); 
var clc = require('cli-color'); //pretty colors in the server logging

var app = express();


//server for clients
var server = require('http').createServer(app).listen(8000);
var io = require('socket.io').listen(server);

//server for sound engine
var sese = require('http').createServer(app).listen(8001);
var iose = require('socket.io').listen(sese);

//vars
var clientCount = 0;
var soundSocket; //this will hold the reference to the sound socket. Need to define here so it has proper scope.

global.VALID_COMMANDS = {
    play    : true,
    loop    : true,
    stop    : true,
    pause   : true,
    vol     : true,
    pan     : true
}

iose.sockets.on('connection', function (client) {
    console.log(clc.whiteBright.bgBlack("sound engine connected"));
    console.log(clc.whiteBright.bgBlack("sound engine socket id: " + client.id));
    soundSocket = client;

    client.on('message', function(data) {
    //This fires when the sound engine sends a message
        console.log(data);
        console.log("got a message from sound engine!");
    });
});


//CHAT SERVER EVENTS
io.sockets.on('connection', function (client) {

	client.on('message', function(msg) {
    //This fires when any chat client sends a message

		//parse out the message to see if its valid
		var result = f.cmdCheck(msg);
        console.log(result);

		if (typeof(result) !== 'boolean') {
			//only continue if command was valid

			//send command to sound engine. Ideally should have a callback
            soundSocket.emit('command', { 
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
