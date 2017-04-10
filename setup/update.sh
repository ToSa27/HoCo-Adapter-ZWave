#!/bin/bash
cd "${0%/*}"
. ${HOCO_HOME}/data/config.sh
sudo systemctl stop hoco-zwave.service
export HOCO_ZWAVE_OZW_VERSION=1.4.1
wget http://old.openzwave.com/downloads/openzwave-${HOCO_ZWAVE_OZW_VERSION}.tar.gz
tar zxvf openzwave-*.gz
cd openzwave-*
make
sudo make install
cd ..
rm -rf openzwave-*
if [ -z "$LD_LIBRARY_PATH" ]; then
  export LD_LIBRARY_PATH=/usr/local/lib
  sudo su -c "echo 'LD_LIBRARY_PATH=/usr/local/lib' >> /etc/environment"
else
  echo $LD_LIBRARY_PATH | grep -q "/usr/local/lib"
  if [ $? -eq 0 ]; then
    export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib
    sudo su -c "echo 'LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib' >> /etc/environment"
  fi
fi
cd ..
npm install
sudo cp setup/hoco-zwave.service /etc/systemd/system/
sudo systemctl enable hoco-zwave.service
