const MongoClient = require('mongodb').MongoClient;
var exports = module.exports = {};


const colNameLogs = 'logs';
const colNamePageView = 'pageViews';

var client;
exports.cols = {
    logs: null,
    pageViews: null,
    siteVisitors: null,
    siteUniqueVisitors: null
};


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
    this.cols.logs = db.collection('logs');
    this.cols.pageViews = db.collection('pageViews');
    this.cols.siteVisitors = db.collection('siteVisitors');
    this.cols.siteUniqueVisitors = db.collection('siteUniqueVisitors');

    await this.dbCreateIndexes(db);
    return this.cols;
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
    // console.log('getStat: ', req.query);
    if (typeof this[req.query.function] != 'function') {
        return {
            code: -5,
            message: 'function does not exists'
        };
    }
    const res = await this[req.query.function](req);
    // console.log(`Return of ${req.query.function}: `, res);
    return res;
}

exports.pageView = async function (req) {
    // console.log('pageView: ', req.query);
    const q = req.query;
    const spec = {
        $and: [
            {
                year: {
                    $gte: parseInt(q.from_year, 10)
                },
                month: {
                    $gte: parseInt(q.from_month, 10)
                },
                day: {
                    $gte: parseInt(q.from_day, 10)
                }
            },
            {
                year: {
                    $lte: parseInt(q.to_year, 10)
                },
                month: {
                    $lte: parseInt(q.to_month, 10)
                },
                day: {
                    $lte: parseInt(q.to_day, 10)
                }
            }
        ]
    };

    if ( q.domain != void 0 ) {
        spec['$and'].push( { domain: q.domain });
    } else {
        spec['$and'].push( { domain: {$exists: false} });
    }

    // console.log("pageView::spec", spec)
    const res = await this.cols.pageViews.find(spec)
        .project({
            _id: 0,
            domain: 1,
            year: 1,
            month: 1,
            day: 1,
            count: 1
        })
        .toArray();
    // console.log('res: ', res);

    return res;
}

exports.siteUniqueVisitorsView = async function (req) {
    // console.log('siteUniqueVisitorsView: ', req.query);
    const q = req.query;
    const spec = {
        $and: [
            {
                year: {
                    $gte: parseInt(q.from_year, 10)
                },
                month: {
                    $gte: parseInt(q.from_month, 10)
                },
                day: {
                    $gte: parseInt(q.from_day, 10)
                }
            },
            {
                year: {
                    $lte: parseInt(q.to_year, 10)
                },
                month: {
                    $lte: parseInt(q.to_month, 10)
                },
                day: {
                    $lte: parseInt(q.to_day, 10)
                }
            }
        ]
    };


    if ( q.domain != void 0 ) {
        spec['$and'].push( { domain: q.domain });
    } else {
        spec['$and'].push( { domain: {$exists: false} });
    }

    // console.log('siteUniqueVisitorsView::spec', spec);
    const res = await this.cols.siteUniqueVisitors.find(spec)
        .project({
            _id: 1,
            domain: 1,
            year: 1,
            month: 1,
            day: 1,
            count: 1
        })
        .toArray();
    // console.log('res: ', res);

    if ( res ) return res;
    else return [];
}



exports.log = async function (socket, data) {
    const logObject = this.documentData(socket, data);
    const re = await this.cols.logs.insertOne(logObject);
    if (re.insertedCount == 1) {

    } else {
        console.log('error ... !');
    }    
    this.preProcess(logObject);

}


exports.expectToBeTrue = function (re, msg) {
    if (re) {
        console.log(`SUCCESS: ${msg}`);
    } else {
        console.log(`FAILURE: ${msg}`);
        console.log(`^^^^^^^^^^^^^^^`);
    }
}


/**
 * 
 * @param {*} obj is log object
 *
 * @todo transaction
 */
exports.preProcess = async function (obj) {
    await this.preProcessPageView(obj);
    await this.preProcessPageVisitor(obj);
}


/**
 * Do log pre processing for page view.
 * @param {*} obj log object
 */
exports.preProcessPageView = async function (obj) {
    let spec = {
        year: obj.year,
        month: obj.month,
        day: obj.day
    };
    await this.increaseCountBySpec( spec );

    spec = {
        domain: obj.domain,
        year: obj.year,
        month: obj.month,
        day: obj.day
    };
    await this.increaseCountBySpec( spec );
}

exports.increaseCountBySpec = async function( spec ) {
    const re = await this.cols.pageViews.find(spec).toArray();
    let count = 0;
    if (re.length) {
        count = re[0].count;
    }
    count++;
    await this.cols.pageViews.updateOne(spec, {
        $set: {
            count: count
        }
    }, {
        upsert: true
    });
}

exports.preProcessPageVisitor = async function (obj) {
    let spec = {
        year: obj.year,
        month: obj.month,
        day: obj.day,
        ip: obj.ip
    };
    let re = await this.cols.siteVisitors.find(spec).toArray();
    var set = {};
    if (re.length) {
        set['idx_member'] = re[0].idx_member;
        set['idx_member'][obj.idx_member] = true;
    } else {
        set = {
            idx_member: {
                [obj.idx_member]: true
            }
        }
    }
    re = await this.cols.siteVisitors.updateOne(spec, {
        $set: set
    }, {
        upsert: true
    });

    spec = {
        year: obj.year,
        month: obj.month,
        day: obj.day
    };
    await this.increasesiteUniqueVisitorsBySpec( spec );
    spec = {
        domain: obj.domain,
        year: obj.year,
        month: obj.month,
        day: obj.day
    };
    await this.increasesiteUniqueVisitorsBySpec( spec );

    if (re.matchedCount == 0) {
    } else {
        // console.log('ip exist');
    }

}

exports.increasesiteUniqueVisitorsBySpec = async function( spec ) {
    const re = await this.cols.siteUniqueVisitors.find(spec).toArray();
    let count = 0;
    if ( re.length ) {
        count = re[0].count;
    }
    count++;
    await this.cols.siteUniqueVisitors.updateOne(spec, {
        $set: {
            count: count
        }
    }, {
        upsert: true
    });
}


exports.dbCreateIndexes = async function () {
    /**
     * logs Indexes
     */
    await this.cols.logs.createIndex({
        domain: 1,
        year: 1,
        month: 1,
        day: 1,
        hour: 1
    });
    await this.cols.logs.createIndex({
        year: 1,
        month: 1,
        day: 1,
        hour: 1
    });
    await this.cols.logs.createIndex({
        domain: 1,
        time: 1,
        ip: 1
    });
    await this.cols.logs.createIndex({
        time: 1,
        ip: 1
    });
    await this.cols.logs.createIndex({
        domain: 1,
        time: 1,
        path: 1
    });
    await this.cols.logs.createIndex({
        time: 1,
        path: 1
    });
    await this.cols.logs.createIndex({
        time: 1,
        idx_member: 1
    });

    /**
     * PageView Indexes
     */
    await this.cols.pageViews.createIndex({
        year: 1,
        month: 1,
        day: 1
    });
    await this.cols.pageViews.createIndex({
        domain: 1,
        year: 1,
        month: 1,
        day: 1
    });
    await this.cols.siteVisitors.createIndex({
        year: 1,
        month: 1,
        day: 1,
        ip: 1
    });
    await this.cols.siteVisitors.createIndex({
        domain: 1,
        year: 1,
        month: 1,
        day: 1,
        ip: 1
    });
    await this.cols.siteUniqueVisitors.createIndex({
        year: 1,
        month: 1,
        day: 1
    });
    await this.cols.siteUniqueVisitors.createIndex({
        domain: 1,
        year: 1,
        month: 1,
        day: 1
    });

}