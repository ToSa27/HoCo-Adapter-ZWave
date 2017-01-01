const EventEmitter = require('events');
const util = require('util');
const log = require("./log.js");
const ZwaveLib = require('openzwave-shared');

var _homeid;
var _zwave;
var _config;
var _connected = false;

function Zwave(config) {
	log.info("zwave config: " + JSON.stringify(config));
	EventEmitter.call(this);
	var self = this;
	_config = config;
	_zwave = new ZwaveLib({
		ConsoleOutput: false,
		Logging: false,
		SaveConfiguration: false,
		DriverMaxAttempts: 3,
		PollInterval: 500,
		SuppressValueRefresh: true
	});
	_zwave.connect(_config.device);
	
	_zwave.on('driver ready', function(homeid) {
		log.info("zwave driver ready");
		_connected = true;
		self.emit("connected", homeid);
	});

	_zwave.on('driver failed', function() {
                log.info("zwave driver failed");
		_connected = false;
		_zwave.disconnect();
		self.emit("disconnected");
	});

	_zwave.on('scan complete', function() {
                log.info("zwave scan complete");
// ToDo: emit "ready" here???
	});
};

util.inherits(Zwave, EventEmitter)

Zwave.prototype.connected = function() {
        return _connected;
};

module.exports = Zwave;
