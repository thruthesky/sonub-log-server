var cors = require('cors')
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const MongoClient = require('mongodb').MongoClient;
var share = require('./share');

var port = 3080;

share.dbConnect();

app.use(cors());
/**
 * '0.0.0.0' means we want to use IPv4
 */
server.listen(port, '0.0.0.0', function () {
  console.log(`Server starts on ${port} with IPv4`);
});

app.get('/', async function (req, res) {
  const ret = Object.assign({}, req.query);
  ret['data'] = await share.getStat(req);
  res.json(ret);
})


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