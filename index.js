var fs = require('fs');
var app = require('express')();
var https = require('https');
var cors = require('cors');
var server = https.createServer({
  key: fs.readFileSync('./star_sonub.key'),
  cert: fs.readFileSync('./star_sonub.crt'),
  // requestCert: false,
  rejectUnauthorized: false
}, app);
server.listen(4431, '0.0.0.0', function() {
  console.log('Sonub realtime server is running on 4431 with IPv4!');
});

app.use(cors());
app.get("/", function (req, res) {
  res.write("Sonub supporting server!");
  res.end();
});

var share = require('./share');
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
  socket.emit('welcome', `let's begin`);
  // Wait for additional log message from client.
  socket.on('log', function (data) {
    share.log(socket, data);
  });
});