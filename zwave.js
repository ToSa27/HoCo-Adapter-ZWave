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
		_homeid = homeid;
	});

	_zwave.on('driver failed', function() {
                log.info("zwave driver failed");
		_connected = false;
		_zwave.disconnect();
		self.emit("disconnected");
	});

	_zwave.on('scan complete', function() {
                log.info("zwave scan complete");
                _connected = true;
                self.emit("connected", _homeid.toString(16));
	});

	_zwave.on('node ready', function(nodeid, nodeinfo){
		log.info("zwave node ready: " + nodeid + ": " + JSON.stringify(nodeinfo));
		self.emit("node", "status", "online", JSON.stringify(nodeinfo));
	});

	_zwave.on('node event', function(nodeid, data) {
		log.info("zwave node event: " + nodeid + ": " + JSON.stringify(data));
		// ToDo
	});

	_zwave.on('value added', function(nodeid, commandclass, valueId) {
		log.info("zwave value added: " + nodeid + " / " + commandclass + " / " + JSON.stringify(valueId));
	});
	
/*
	_zwave.on('controller command', function(r,s) {
		log.info('controller command: r=' + r + ', s=' + s);
	});

	_zwave.on('notification', function(nodeid, notif) {
		log.info('zwave notification: ' + nodeid + ' / ' + notif);
		switch (notif) {
			case 0:
				console.log('node%d: message complete', nodeid);
				break;
                case 1:
                        console.log('node%d: timeout', nodeid);
                        break;
                case 2:
                        console.log('node%d: nop', nodeid);
                        break;
                case 3:
                        console.log('node%d: node awake', nodeid);
                        break;
                case 4:
                        console.log('node%d: node sleep', nodeid);
                        break;
                case 5:
                        console.log('node%d: node dead', nodeid);
                        break;
                case 6:
                        console.log('node%d: node alive', nodeid);
                        break;
	        }
	});
*/

};

util.inherits(Zwave, EventEmitter)

Zwave.prototype.connected = function() {
        return _connected;
};

Zwave.prototype.adapter = function(command, message) {
	switch (command) {
		case "learn":
			_zwave.addNode(_homeid, true);
			break;
	}
};

Zwave.prototype.node = function(nodeid, command, message) {
}

Zwave.prototype.parameter = function(nodeid, parameterid, command, message) {
}

module.exports = Zwave;
