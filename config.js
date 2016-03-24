var Config = {
    VALID_COMMANDS : { 
	    play    : true,
	    loop    : true,
	    stop    : true,
	    pause   : true,
	    vol     : true,
	    pan     : true
    },
    PORTS : {
    	sengine : 8001,
    	sclient : 8000
    }
};    
module.exports = Config;