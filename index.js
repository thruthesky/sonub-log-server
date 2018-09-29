var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var mongoose = require('mongoose');


var port = 3080;


mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var Logs = new mongoose.Schema({
  ip: String,
  path: String,
  userAgent: String,
  year: Number,
  month: Number,
  day: Number,
  hour: Number,
  time: Number
}, {
  collection: 'logs',
  strict: false
});


/**
 * Create index on mongoose. No return value?
 */
Logs.index({
  year: 1,
  month: 1,
  day: 1,
  hour: 1
}, { name: 'Ymdh' });


Logs.index({ ip: 1}, {name: 'ip'});
Logs.index({ path: 1}, {name: 'path'});
Logs.index({ time: 1}, {name: 'time'});

var logs = mongoose.model('Logs', Logs);


/**
 * '0.0.0.0' means we want to use IPv4
 */
server.listen(port, '0.0.0.0', function () {
  console.log(`Server starts on ${port} with IPv4`);
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

/**
 * Wait for client connection
 */
io.on('connection', function (socket) {
  /**
   * We got a client
   */

  /**
   * Save very first log for the client.
   */
  var log = new logs( documentData(socket) );
  log.save();

  /**
   * Welcome client. Send a message to client.
   */
  socket.emit('welcome', documentData(socket));

  /**
   * Wait for additional log message from client.
   */
  socket.on('log', function (data) {
    var log = new logs( documentData(socket, data) );
    log.save();
  });

});


function documentData( socket, data ) {
  var d = ( new Date() );
  return {
    ip: socket.request.connection.remoteAddress,
    userAgent: socket.request.headers['user-agent'],
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    time: d.getTime(),
    path: data.path
  };
}
