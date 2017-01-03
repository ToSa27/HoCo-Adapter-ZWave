var config = require("./config.js");
var log = require("./log.js");
var Bus = require("./bus.js");
var Zwave = require("./zwave.js");

var adaptertype = "zwave";
var adapterid;

var bus;
var gw;

gw = new Zwave(config[adaptertype]);

gw.on("connected", function(id) {
	adapterid = id;
	bus = new Bus(config.mqtt, adaptertype, adapterid);

	bus.on("connected", () => {
		log.info("bus connected");
		if (gw)
			if (gw.connected())
				bus.adapterSend("status", "online", {}, 0, false);
	});

	bus.on("adapter", (command, message) => {
	        log.info("bus adapter command: " + command + ": " + message);
		gw.adapter(command, message);
	});

	bus.on("node", (nodeid, command, message) => {
	        log.info("bus node command: " + command + " for " + nodeid + ": " + message);
                gw.node(nodeid, command, message);
	});

	bus.on("parameter", (nodeid, parameterid, command, message) => {
	        log.info("bus parameter command: " + command + " for " + nodeid + "/" + parameterid + ": " + message);
                gw.parameter(nodeid, parameterid, command, message);
	});

});
