var config = require('./config.js');

module.exports = function(){}; 

module.exports.cmdCheck =

/* function to parse out a command
     * @param   string s (unparsed command string)
     * @return  object || false
*/
function cmdCheck(s) {

    var cmdParsed = {}; //if s is a valid command string, let's get ready to return a nicely parsed object
        	
    //check first char for /
	var firstChar = s[0];
	if (firstChar != '/') {
		console.log("invalid command");
		return false;
	}

	//find first space
	var firstSpace = s.indexOf(" ");
	if (firstSpace === -1) {
		console.log("no space in command. Invalid format")
		return false;
	}

	s = s.replace(/\s{2,}/g, ' '); //take out duplicate spaces for people who don't type good

	console.log("Command format valid. Evaluate whether or not it's a valid command");

    var sParsed = s.substr(1).split(" "); //parse out string (without first / char), space delimited

    //check command validity
    if (config.VALID_COMMANDS[sParsed[0]] !== undefined) {
        console.log("valid command");
    }
    else {
        console.log("Command format valid, but command not found in list of accepted commands");
        return false;
    }
    //check id validity
    //check val validity

    cmdParsed['cmd'] = sParsed[0];
    cmdParsed['id'] = sParsed[1];
    cmdParsed['val'] = sParsed[2];

	//if we reach here, command is valid, return parsed object
	return cmdParsed;
};