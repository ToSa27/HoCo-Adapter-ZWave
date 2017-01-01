var config = require("./config.js");
var log = require("./log.js");
var Bus = require("./bus.js");
var bus;

var Zwave = require("./zwave.js");
var gw = new Zwave(config.zwave);

gw.on("connected", function(homeid) {
	bus = new Bus(config.mqtt, "zwave", homeid.toString(16));

	bus.on("connected", () => {
		log.info("bus connected");
	});

	bus.on("adapter", (command, message) => {
	        log.info("bus adapter command: " + command + ": " + message);
	});

	bus.on("node", (nodeid, command, message) => {
	        log.info("bus node command: " + command + " for " + nodeid + ": " + message);
	});

	bus.on("parameter", (nodeid, parameterid, command, message) => {
	        log.info("bus parameter command: " + command + " for " + nodeid + "/" + parameterid + ": " + message);
	});
});

