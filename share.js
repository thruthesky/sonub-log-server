const MongoClient = require('mongodb').MongoClient;
var exports = module.exports = {};


var client;
var col; // client connection with collection


/**
 * 
 * @example
    const col = await share.dbConnect();
    col.deleteMany({});
    await runTest();
    share.dbClose();
 */
exports.dbConnect = async function () {
    console.log('Trying to connect to MongoDB...')
    let db;
    try {
        client = await MongoClient.connect('mongodb://localhost');
        db = client.db('test');
    } catch (err) {
        console.log(err.stack);
        return;
    }
    col = db.collection('logs');
    return col;
};

exports.dbClose = function () {
    client.close();
}


exports.documentData = function (socket, data) {
    if (typeof data != 'object') {
        data = {};
    }
    if (typeof data['path'] == 'undefined') {
        data.path = '';
    }
    if (typeof data['domain'] == 'undefined') {
        data.domain = '';
    }
    if (typeof data['idx_member'] == 'undefined') {
        data.idx_member = 0;
    }
    var d = new Date();
    if (data.date) {
        d = new Date(data.date);
    }

    
    return {
        domain: data.domain,
        ip: socket.request.connection.remoteAddress,
        userAgent: socket.request.headers['user-agent'],
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate(),
        hour: d.getHours(),
        time: d.getTime(),
        path: data.path,
        idx_member: data.idx_member
    };
}

exports.getStat = async function (req) {
    if (typeof this[req.function] != 'function') {
        return {
            code: -5,
            message: 'function does not exists'
        };
    }

    return await this[req.function](req);
}

exports.pageView = async function (req) {

    // console.log('pageView: ', req);


    const res = await col.find({
        $and: [
            {
                year: {$gte: req.from_year },
                month: {$gte: req.from_month },
                day: {$gte: req.from_day }
            },
            {
                year: {$lte: req.to_year },
                month: {$lte: req.to_month },
                day: {$lte: req.to_day }
            }
        ]
    }).toArray();

    // console.log('res: ', res);

    return res;
}

exports.log = async function (socket, data) {
    const re = await col.insertOne( this.documentData(socket, data) );
    if ( re.insertedCount == 1 ) {

    } else {
        console.log('error ... !');
    }
}


exports.expectToBeTrue = function(re, msg) {
    if ( re ) {
        console.log(`SUCCESS: ${msg}`);
    } else {
        console.log(`FAILURE: ${msg}`);
        console.log(`^^^^^^^^^^^^^^^`);
    }
}
