const EventEmitter = require('events');
const util = require('util');
const log = require("../common/log.js");
const ZwaveLib = require('openzwave-shared');

function Zwave(config) {
	log.debug("zwave config: " + JSON.stringify(config));
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
		log.debug("zwave driver ready");
		self.id = homeid.toString(16);
                self.emit("connected", self, self.id);
	});

	this.zwave.on('driver failed', function() {
                log.debug("zwave driver failed");
		self.connected = false;
		self.zwave.disconnect();
		self.emit("disconnected", self);
	});

	this.zwave.on('scan complete', function() {
                log.debug("zwave scan complete");
                self.connected = true;
	});

        this.zwave.on('node added', function(nodeid) {
                log.debug("zwave node added: " + nodeid);
		self.emit("node added", self, nodeid, {});
        });

        this.zwave.on('node removed', function(nodeid) {
                log.debug("zwave node removeed: " + nodeid);
		self.emit("node removed", self, nodeid);
        });

        this.zwave.on('node naming', function(nodeid, nodeinfo) {
                log.debug("zwave node naming: " + nodeid + ": " + JSON.stringify(nodeinfo));
        });

        this.zwave.on('node available', function(nodeid, nodeinfo) {
                log.debug("zwave node available: " + nodeid + ": " + JSON.stringify(nodeinfo));
        });

	this.zwave.on('node ready', function(nodeid, nodeinfo){
		log.debug("zwave node ready: " + nodeid + ": " + JSON.stringify(nodeinfo));
	});

	this.zwave.on('node event', function(nodeid, data) {
		log.debug("zwave node event: " + nodeid + ": " + JSON.stringify(data));
	});

	this.zwave.on('value added', function(nodeid, commandclass, valueId) {
		log.debug("zwave value added: " + nodeid + " / " + commandclass + " / " + JSON.stringify(valueId));
		self.emit("parameter added", self, nodeid, commandclass + "_" + valueId.instance + "_" + valueId.index);
                self.emit("parameter value", self, nodeid, commandclass + "_" + valueId.instance + "_" + valueId.index, valueId.value, valueId);
	});

        this.zwave.on('value changed', function(nodeid, commandclass, valueId) {
                log.debug("zwave value changed: " + nodeid + " / " + commandclass + " / " + JSON.stringify(valueId));
                self.emit("parameter value", self, nodeid, commandclass + "_" + valueId.instance + "_" + valueId.index, valueId.value, valueId);
        });

        this.zwave.on('value removed', function(nodeid, commandclass, instance, index) {
                log.debug("zwave value removed: " + nodeid + " / " + commandclass + " / " + instance + "/" + index);
		self.emit("parameter removed", self, nodeid, commandclass + "_" + instance + "_" + index);
        });

	this.zwave.on('controller command', function(nodeid, ctrlState, ctrlError, helpmsg){
                log.debug("zwave controller command: " + nodeid + ": " + ctrlState + " / " + ctrlError + " / " + helpmsg);
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
	switch (command) {
		case "set":
			var paramParts = parameterid.split('_');
			this.zwave.setValue({
				node_id: nodeid, 
				class_id: paramParts[0], 
				instance: paramParts[1], 
				index: paramParts[2]
			}, message.val);
			break;
	}
}

module.exports = Zwave;
