
var exports = module.exports = {};


var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : '_sonub',
    password : 'Wc~045s$5',
    database : '_sonub'
});
connection.connect();

exports.connection = connection;



exports.documentData = function (socket, data) {
    var res = {
        YmdHis: parseInt(this.YmdHis(), 10),
        domain: data.domain,
        ip: socket.request.connection.remoteAddress,
        user_agent: socket.request.headers['user-agent'],
        referrer: data.referrer,
        path: data.path,
        idx_member: data.idx_member,
        id: data.id,
        lang: data.lang,
        status: ''
    };
    return res;
}


/**
 * 
 * @param {*} n 
 */
exports.add0 = function(n) {
    if ( n < 10 ) {
        return '0' + n;
    } else {
        return '' + n;
    }
}
exports.YmdHis = function () {
    const d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    return year + this.add0( month ) + this.add0(day) + this.add0( hours ) + this.add0(minutes) + this.add0(seconds);
}

exports.log = function (socket, data) {
    const logObject = this.documentData(socket, data);
    // console.log('logBoject: ', logObject);
    connection.query('INSERT INTO logs SET ? ', logObject, function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
    });
    //
    // const db = this.db;
    // db.serialize(function() {
    //     // db.run( "BEGIN" );
    //     const $q = "INSERT INTO logs VALUES(null, $YmdHis, $domain, $path, $ip, $user_agent, $idx_member, $id, $referrer, $lang, $status ) ";
    //     db.run( $q, logObject );
    //     // db.run( "COMMIT" );
    // });
}

