#! /bin/sh
# /etc/init.d/zappcmsrunner.sh

if ! ps ax | grep -v grep | grep 'supervisor server.js' > /dev/null
then
  cd /home/nodeserver/papaya-fiction/zappcms/src/
  nohup supervisor server.js > /dev/null &
else
  echo "zappcms server already running"
fi

exit 0