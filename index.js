var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const MongoClient = require('mongodb').MongoClient;
var share = require('./share');

var port = 3080;

share.dbConnect();

// var db; // db instance
// MongoClient.connect(share.db.url, function(err, client) {
//   console.log("Connected successfully to MongoDb server");
//   db = client.db(share.db.name);
// });


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

  /**
   * Welcome client. Send a message to client.
   */
  socket.emit('welcome', `let's begin`);

  /**
   * Wait for additional log message from client.
   */
  socket.on('log', function (data) {
    share.log(socket, data);
  });

});

