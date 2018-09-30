const MongoClient = require('mongodb').MongoClient;
var exports = module.exports = {};


const colNameLogs = 'logs';
const colNamePageView = 'pageViews';

var client;
exports.cols = {
    logs: null,
    rootSitePageViews: null,
    blogSitePageViews: null,
    rootSiteVisitorsByIp: null,
    blogSiteVisitorsByIp: null
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
    this.cols.rootSitePageViews = db.collection('rootSitePageViews');
    this.cols.blogSitePageViews = db.collection('blogSitePageViews');
    this.cols.rootSiteVisitorsByIp = db.collection('rootSiteVisitorsByIp');
    this.cols.blogSiteVisitorsByIp = db.collection('blogSiteVisitorsByIp');

    await this.dbCreateIndexes(db);
    return this.cols;
};

exports.dbClose = async function () {
    try {
        await client.close();
    } catch ( e ) {
        console.log('=================> Caught in DB closing...');
        console.log(e.message);
    }
    
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


exports.log = async function (socket, data) {
    const logObject = this.documentData(socket, data);
    const re = await this.cols.logs.insertOne(logObject);
    if (re.insertedCount == 1) {

    } else {
        console.log('error ... !');
    }    
    await this.preProcess(logObject);

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
    await this.preProcessSiteVisitorByIP(obj);
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
    await this.increaseCountBySpec('rootSitePageViews', spec );

    spec = {
        domain: obj.domain,
        year: obj.year,
        month: obj.month,
        day: obj.day
    };
    await this.increaseCountBySpec('blogSitePageViews', spec );
}

exports.increaseCountBySpec = async function( colName, spec ) {
    const re = await this.cols[colName].find(spec).toArray();
    let count = 0;
    if (re.length) {
        count = re[0].count;
    }
    count++;
    await this.cols[colName].updateOne(spec, {
        $set: {
            count: count
        }
    }, {
        upsert: true
    });
}

exports.preProcessSiteVisitorByIP = async function (obj) {
    let spec = {
        year: obj.year,
        month: obj.month,
        day: obj.day
    };
    // await this.increaseCountBySpec('rootSiteVisitorsByIp', spec, { unique: 'ip' });

    /**
     * Count by Unique IP.
     * If same IP access twice, then don't count it.
     */
    const findSpec = Object.assign({ ip: obj.ip }, spec );
    const f = await this.cols.logs.find( findSpec ).toArray();
    if ( f.length == 1 ) {
        await this.increaseCountBySpec('rootSiteVisitorsByIp', spec, { unique: 'ip' });
    }

    /**
     * Count by Unique IP per each blog.
     * If same IP access the same blog, then don't count it.
     */
    const findBlogIpspec = Object.assign({ ip: obj.ip, domain: obj.domain }, spec);
    const fb = await this.cols.logs.find( findBlogIpspec ).toArray();
    if ( fb.length == 1 ) {
        spec['domain'] = obj.domain;
        await this.increaseCountBySpec('blogSiteVisitorsByIp', spec);
    }

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
    await this.cols.rootSitePageViews.createIndex({
        year: 1,
        month: 1,
        day: 1
    });
    await this.cols.blogSitePageViews.createIndex({
        domain: 1,
        year: 1,
        month: 1,
        day: 1
    });
    await this.cols.rootSiteVisitorsByIp.createIndex({
        year: 1,
        month: 1,
        day: 1,
        ip: 1
    });
    await this.cols.blogSiteVisitorsByIp.createIndex({
        domain: 1,
        year: 1,
        month: 1,
        day: 1,
        ip: 1
    });
    
}