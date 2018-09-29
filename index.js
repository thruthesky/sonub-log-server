var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var mongoose = require('mongoose');
var share = require('./share');

var port = 3080;


mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var logs = share.initMongoose();


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
  // var log = new logs( documentData(socket) );
  // log.save();

  /**
   * Welcome client. Send a message to client.
   */
  socket.emit('welcome', `let's begin`);

  /**
   * Wait for additional log message from client.
   */
  socket.on('log', function (data) {
    var log = new logs( share.documentData(socket, data) );
    log.save();
  });

});

