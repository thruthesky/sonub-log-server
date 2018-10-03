# sonub-log-server

NodeJS Server for sonub logging

## Install

```` sh
git clone https://github.com/thruthesky/sonub-supporting-server
chmod 777 sonub-supporting-server
cd sonub-supporting-server
cp sonub.sqlite3.template sonub.sqlite3
chmod 777 sonub.sqlite3
npm i
./node_modules/.bin/pm2 start sonub-supporting-server.js
````
