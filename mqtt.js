var logger = require("./log.js");
var Mqtt = require('mqtt');

var config;
var tech;
var id;
var mqtt;
var connected = false;

var Bus = function(newconfig, newtech, newid) {
	config = newconfig;
	tech = newtech;
	id = newid;
	mqtt = Mqtt.connect(config.mqtt.url, {
		username: config.mqtt.username,
		password: config.mqtt.password,
		will: {
			topic: config.mqtt.prefix + '/$announce',
			payload: JSON.stringify({
				type: 'adapter',
				technology: tech,
				id: id,
				ready: false
			}),
			qos: 0,
			retain: true
		}
	});
	
	mqtt.on('connect', function () {
		connected = true;
		mqtt.subscribe(config.mqtt.prefix + "/" + tech + "/" + id + "/#");
		mqtt.publish(config.mqtt.prefix + '/$announce', JSON.stringify({
			type: 'adapter',
			technology: tech,
			id: id,
			ready: true
		}), { qos: 0, retain: true});
	// ToDo: emit("connected");
	});

	mqtt.on('message', function (topic, message) {
		var topicParts = topic.split('/');
		if (topicParts[0] != config.mqtt.prefix)
			return;
		if (topicParts[1] != tech)
			return;
		if (topicParts[2] != id)
			return;
		if (topicParts[3][0] == '$') {
	// ToDo: emit("command");
		} else {
	// ToDo: emit("message");
		}
	});
};

Bus.prototype.connected = function() {
	return connected;
};

Bus.prototype.publish = function(topic, payload, qos, retain) {
	if (connected) {
		mqtt.publish(config.mqtt.prefix + "/" + topic, payload, qos, retain);
	};
};

module.exports = Bus;

