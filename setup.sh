#!/bin/bash
cd "${0%/*}"
. ${HOCO_HOME}/config.sh
. config.sh
sudo apt-get install -y libudev-dev
wget http://old.openzwave.com/downloads/openzwave-${HOCO_ZWAVE_OZW_VERSION}.tar.gz
tar zxvf openzwave-*.gz
cd openzwave-*
make
sudo make install
cd ..
rm -rf openzwave-*
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/usr/local/lib
sudo su -c "echo 'LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/usr/local/lib' >> /etc/environment"
npm install
echo '{' > config.json
echo ' "mqtt": {'>> config.json
echo '  "url": "'${HOCO_MQTT_URL}'",'>> config.json
echo '  "username": "'${HOCO_MQTT_USER}'",'>> config.json
echo '  "password": "'${HOCO_MQTT_PASS}'",'>> config.json
echo '  "prefix": "'${HOCO_MQTT_PREFIX}'"'>> config.json
echo ' },'>> config.json
echo ' "zwave": {'>> config.json
echo '  "device": "'${HOCO_ZWAVE_DEVICE}'"'>> config.json
echo ' }'>> config.json
echo '}'>> config.json
pm2 start ${PWD}/app.js --name "zwave"
pm2 dump
