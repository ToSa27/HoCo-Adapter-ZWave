var config = require("./config.js");
var logger = require("./log.js");
var mqtt = require("./mqtt.js");

var bus = new mqtt(config, "zwave", "12345678");

//var zwave = require("./zwave.js");
//var gw = 
