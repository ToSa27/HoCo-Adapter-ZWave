const EventEmitter = require('events');
const util = require('util');
const log = require("../common/log.js");
const ZwaveLib = require('openzwave-shared');

function Zwave(config) {
	log.info("zwave config: " + JSON.stringify(config));
	EventEmitter.call(this);
	var self = this;
	this.config = config;
	this.connected = false;
	this.zwave = new ZwaveLib({
		ConsoleOutput: false,
		Logging: false,
		SaveConfiguration: false,
		DriverMaxAttempts: 3,
		PollInterval: 500,
		SuppressValueRefresh: true
	});
	this.zwave.connect(this.config.device);
	
	this.zwave.on('driver ready', function(homeid) {
		log.info("zwave driver ready");
		self.id = homeid.toString(16);
	});

	this.zwave.on('driver failed', function() {
                log.info("zwave driver failed");
		self.connected = false;
		self.zwave.disconnect();
		self.emit("disconnected");
	});

	this.zwave.on('scan complete', function() {
                log.info("zwave scan complete");
                self.connected = true;
                self.emit("connected", self.id);
	});

	this.zwave.on('node ready', function(nodeid, nodeinfo){
		log.info("zwave node ready: " + nodeid + ": " + JSON.stringify(nodeinfo));
		self.emit("node", "status", "online", JSON.stringify(nodeinfo));
	});

	this.zwave.on('node event', function(nodeid, data) {
		log.info("zwave node event: " + nodeid + ": " + JSON.stringify(data));
		// ToDo
	});

	this.zwave.on('value added', function(nodeid, commandclass, valueId) {
		log.info("zwave value added: " + nodeid + " / " + commandclass + " / " + JSON.stringify(valueId));
	});
	
};

util.inherits(Zwave, EventEmitter)

Zwave.prototype.adapter = function(command, message) {
	switch (command) {
		case "learn":
			this.zwave.addNode(this.id, true);
			break;
	}
};

Zwave.prototype.node = function(nodeid, command, message) {
}

Zwave.prototype.parameter = function(nodeid, parameterid, command, message) {
}

module.exports = Zwave;
