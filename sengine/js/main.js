(function() {

	var debug = true;
	var soundInstance = []; //master array of SoundInstance objects
	var manifest; //master array of source wav files and their ids

	if (!debug) {
		console.log = function() {};
	}

	function init() {

		var assetsPath = "wav/";

		//manifest list of all sound files
		manifest = [{
			src: "1.wav",
			id: 0
		}, {
			src: "2.wav",
			id: 1
		}, {
			src: "3.wav",
			id: 2
		}, {
			src: "4.wav",
			id: 3
		}, {
			src: "5.wav",
			id: 4
		}, {
			src: "6.wav",
			id: 5
		}, {
			src: "7.wav",
			id: 6
		}, {
			src: "8.wav",
			id: 7
		}, {
			src: "9.wav",
			id: 8
		}];
		// NOTE the "|" character is used by Sound to separate source into distinct files, which allows you to provide multiple extensions for wider browser support

		createjs.Sound.alternateExtensions = ["mp3"]; // add other extensions to try loading if the src file extension is not supported

		createjs.Sound.addEventListener("fileload", createjs.proxy(soundLoaded, this)); // add an event listener for when load is completed

		createjs.Sound.registerManifest(manifest, assetsPath);

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
			console.log(data);
			if (soundDo(data["cmd"], data["id"], data["val"]) === false) {
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
		//master = event.target.play(event.id, createjs.Sound.INTERRUPT_NONE, 0, 0, false, 1);
		if (event.id < manifest.length - 1) return;
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
				return soundInstance[id].pause(); //returns true[ success] or false [sound isn't currently playing]

			case "stop":
				return soundInstance[id].stop(); //returns true [success] or false [failed]

			case "vol":
				if (typeof(val) === 'undefined') return false; //need value for volume command
				return soundInstance[id].setVolume(val / 100); //returns true [success] or false [failed]

			case "pan":
				if (typeof(val) === 'undefined') return false; //need value for pan command
				return soundInstance[id].setPan(val); //returns true [success] or false [failed]
				return;

			default:

		}
	}

	init();


}());