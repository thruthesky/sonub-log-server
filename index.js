var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var Logs = new mongoose.Schema({
  ip: String,
  path: String,
  time: Number,
  userAgent: String
}, {
  collection: 'logs',
  strict: false
});

console.log('server starts');

var logs = mongoose.model('Logs', Logs);


/**
 * '0.0.0.0' means we want to use IPv4
 */
server.listen(8080, '0.0.0.0');

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  var log = new logs({
    ip: socket.request.connection.remoteAddress,
    userAgent: socket.request.headers['user-agent'],
    time: (new Date).getTime() / 1000
  });
  socket.emit('welcome', {
    ip: socket.request.connection.remoteAddress
  });
  console.log('ip: ', socket.request.connection.remoteAddress);
  log.save();
  
  socket.on('log', function (data) {
    var log = new logs({
      ip: socket.request.connection.remoteAddress,
      userAgent: socket.request.headers['user-agent'],
      time: (new Date).getTime() / 1000
    });
    log.save();
  });
});