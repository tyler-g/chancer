(function() {

	var debug = true;
	var soundInstance = []; //master array of SoundInstance objects
	var soundInstanceCount = 0;
	var manifest = []; //master array of source wav files and their ids

	if (!debug) {
		console.log = function() {};
	}

	function init() {

		var assetsPath = "wav/";
		var manifestLength = 9;

		//randomize the order assignment of sounds for the manifest
		var randomWavNameMap = [];
		var numbersUsed = [];
		var count = 0;
		var randomNum;
		do {
			do {
				randomNum = Math.floor(Math.random() * manifestLength) + 1 //random # from 1 through manifestLength
			}
			while (typeof numbersUsed[randomNum] !== 'undefined');
			numbersUsed[randomNum] = true;
			randomWavNameMap.push(randomNum + '.wav');
			count++;
		}
		while (count < manifestLength);

		console.log('randomized manifest:', randomWavNameMap);

		//populate the manifest
		for (var i = 0; i < manifestLength; i++) {
			var obj = {
				'src' : randomWavNameMap[i],
				id: i
			}
			manifest.push(obj);
		};

		//createjs.Sound.alternateExtensions = ["mp3"]; // add other extensions to try loading if the src file extension is not supported
		createjs.Sound.on("fileload", soundLoaded);
		createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]); //register plugins in order of precedence (webaudio preferred)
		createjs.Sound.registerSounds(manifest, assetsPath);
		console.log('audio plugin using:',createjs.Sound.activePlugin.__proto__.constructor.name);

		//jquery - move this to proper place
		$(function() {
			$('#stopall').on('click', function(e) {
				e.preventDefault();
				for (var i = soundInstance.length - 1; i >= 0; i--) {
					soundInstance[i].stop();
				};
			});
		});
	}

	function startServer() {
		//all sound loaded, now we can start listening for commands
		var PORT = 8001;
		var SERVER = "http://localhost:" + PORT;
		var socket = io.connect(SERVER);
		socket.on('connect', function() {
			console.log('connected');
			//send manifest length to the server
			socket.emit("manifestUpdate", soundInstance.length);
		});
		socket.on('command', function(data, cb) {
			console.log('received command:', data);

			var sd = soundDo(data["cmd"], data["id"], data["val"]);
				console.log(sd);
			if (sd === false) {
				//if it returned false, it failed. Let server know
				socket.emit("message", {
					type: 'error',
					msg: 'got command but it failed'
				});
				cb(false);
			} else {
				//it succeeded
				socket.emit("message", {
					type: 'success',
					msg: 'got command and it succeeded'
				});
				cb(true);
			}
		});

	}

	function soundLoaded(event) {
		soundInstance[event.id] = createjs.Sound.createInstance(event.id);
		soundInstanceCount++;
		if (soundInstanceCount < manifest.length ) return;
		startServer();
	}

	function soundDo(cmd, id, val) {
		if (typeof(cmd) === 'undefined' || typeof(id) === 'undefined') return false; //only val is optional

		switch (cmd) {

			case "play":
				return soundInstance[id].play(); //returns undefined

			case "loop":
				if (val) {
					soundInstance[id].play({
						loop: val
					});
				} else {
					soundInstance[id].play({
						loop: -1
					});
				}
				return;

			case "pause":
				return soundInstance[id].paused = true; //returns true[ success] or false [sound isn't currently playing]

			case "stop":
				return soundInstance[id].stop(); //returns true [success] or false [failed]

			case "vol":
				if (typeof(val) === 'undefined') return false; //need value for volume command
				return soundInstance[id].volume = val / 100; //returns true [success] or false [failed]

			case "pan":
				if (typeof(val) === 'undefined') return false; //need value for pan command
				return soundInstance[id].pan = (val / 100) * 2; //returns true [success] or false [failed]
				
			case "filter":
				if (typeof(val) === 'undefined') return false; //need value for filter command
				return soundInstance[id].filterFrequency = val;
				return;

			default:

		}
	}

	init();


}());