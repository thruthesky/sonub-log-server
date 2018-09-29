
var mongoose = require('mongoose');

var exports = module.exports = {};

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
    if ( data.date ) {
        d = new Date( data.date );
    }
    
    return {
        domain: data.domain,
        ip: socket.request.connection.remoteAddress,
        userAgent: socket.request.headers['user-agent'],
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
        hour: d.getHours(),
        time: d.getTime(),
        path: data.path,
        idx_member: data.idx_member
    };
}



/**
 * Returns model
 */
exports.initMongoose = function () {

    var Logs = new mongoose.Schema({
        domain: String,
        ip: String,
        path: String,
        userAgent: String,
        year: Number,
        month: Number,
        day: Number,
        hour: Number,
        time: Number,
        idx_member: Number
    }, {
        collection: 'logs',
        strict: false
    });


    /**
     * Create index on mongoose. No return value?
     * 
     * Each blog owner can Search/Display by hour.
     */
    Logs.index({
        domain: 1,
        year: 1,
        month: 1,
        day: 1,
        hour: 1
    }, {
        name: 'domain_Ymdh'
    });

    /**
     * Admin can display by date/time of total access.
     */
    Logs.index({
        year: 1,
        month: 1,
        day: 1,
        hour: 1
    }, {
        name: 'Ymdh'
    });

    /**
     * Blog user can search no of IP on specific days.
     */
    Logs.index({
        domain: 1,
        time: 1,
        ip: 1
    }, {
        name: 'domain_time_ip'
    });
    /**
     * Admin can search no of IP on date/time.
     */
    Logs.index({
        time: 1,
        ip: 1
    }, {
        name: 'time_ip'
    });

    /**
     * Blog admin can see which path access the most.
     */
    Logs.index({
        domain: 1,
        time: 1,
        path: 1
    }, {
        name: 'domain_time_path'
    });
    /**
     * Admin can see which path is access the most including all blogs.
     */
    Logs.index({
        time: 1,
        path: 1
    }, {
        name: 'time_path'
    });


    /**
     * Admin can know which user access
     */
    Logs.index({
        time: 1,
        idx_member: 1
    }, {
        name: 'time_idx_member'
    });

    return mongoose.model('Logs', Logs);
}


exports.statPageView = function(req) {
    
}