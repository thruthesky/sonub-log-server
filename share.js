const MongoClient = require('mongodb').MongoClient;
var exports = module.exports = {};

var client;

exports.db = null;

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
    try {
        client = await MongoClient.connect('mongodb://localhost');
        this.db = client.db('test');
    } catch (err) {
        console.log(err.stack);
        return;
    }

    await this.dbCreateIndexes(this.db);
    return this.db;
};

exports.dbClose = async function () {
    try {
        await client.close();
    } catch (e) {
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


    var res = {
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
    res['Ymd'] = this.makeYmd( res );
    return res;
}

exports.makeYmd = function (obj) {

    /**
     * Error handling for wrong parameters.
     */
    if (!obj || !obj.year || typeof obj.month === 'undefined' || !obj.day) {
        return false;
    }
    let Ymd = '';
    Ymd += obj.year;
    if (obj.month < 10) {
        Ymd += '0' + obj.month;
    } else {
        Ymd += '' + obj.month;
    }
    if (obj.day < 10) {
        Ymd += '0' + obj.day;
    } else {
        Ymd += '' + obj.day;
    }
    return Ymd;
}

exports.log = async function (socket, data) {
    const logObject = this.documentData(socket, data);
    const re = await this.col('logs').insertOne(logObject);
    if (re.insertedCount == 1) {

    } else {
        console.log('error ... !');
    }
    await this.preProcess(logObject);
}

// exports.getStat = async function (req) {
//     // console.log('getStat: ', req.query);
//     if (typeof this[req.query.function] != 'function') {
//         return {
//             code: -5,
//             message: 'function does not exists'
//         };
//     }
//     const res = await this[req.query.function](req);
//     // console.log(`Return of ${req.query.function}: `, res);
//     return res;
// }



// exports.pageView = async function (req) {
//     // console.log('pageView', req);
//     const q = req.query;
//     const from_Ymd = this.makeYmd({
//         year: q.from_year,
//         month: q.from_month,
//         day: q.from_day
//     });
//     const to_Ymd = this.makeYmd({
//         year: q.to_year,
//         month: q.to_month,
//         day: q.to_day
//     });
//     const searchSpec = {
//         Ymd: {
//             $gte: from_Ymd,
//             $lte: to_Ymd
//         }
//     };

//     /**
//      * check of blog or main
//      */
//     let collName = 'rootSitePageViews';
//     if (q.domain != void 0) {
//         collName = 'blogSitePageViews';
//         searchSpec['domain'] = q.domain;
//     }
//     return this.searchCollectionBySpec(collName, searchSpec);
// }

// exports.siteUniqueVisitor = async function (req) {
//     // console.log('pageView', req);
//     const q = req.query;
//     const from_Ymd = this.makeYmd({
//         year: q.from_year,
//         month: q.from_month,
//         day: q.from_day
//     });
//     const to_Ymd = this.makeYmd({
//         year: q.to_year,
//         month: q.to_month,
//         day: q.to_day
//     });
//     const searchSpec = {
//         Ymd: {
//             $gte: from_Ymd,
//             $lte: to_Ymd
//         }
//     };

//     /**
//      * check of blog or main
//      */
//     let collName = 'rootSiteVisitorsByIp';
//     if (q.domain != void 0) {
//         collName = 'blogSiteVisitorsByIp';
//         searchSpec['domain'] = q.domain;
//     }
//     return await this.searchCollectionBySpec(collName, searchSpec);
// }

// exports.searchCollectionBySpec = async function( collName, searchSpec) {
//     console.log('searchCollectionBySpec', collName, searchSpec);
//     const res = await this.col(collName).find(searchSpec)
//         .project({
//             _id: 0,
//             domain: 1,
//             Ymd: 1,
//             count: 1
//         })
//         .toArray();
//     return res;
// }




// exports.expectToBeTrue = function (re, msg) {
//     if (re) {
//         console.log(`SUCCESS: ${msg}`);
//     } else {
//         console.log(`FAILURE: ${msg}`);
//         console.log(`^^^^^^^^^^^^^^^`);
//     }
// }


// /**
//  * 
//  * @param {*} obj is log object
//  *
//  * @todo transaction
//  */
// exports.preProcess = async function (obj) {
//     await this.preProcessPageView(obj);
//     await this.preProcessSiteVisitorByIP(obj);
// }


/**
 * Do log pre processing for page view.
 * @param {*} obj log object
 */
// exports.preProcessPageView = async function (obj) {
//     await this.increaseCountBySpec('rootSitePageViews', {
//         Ymd: this.makeYmd(obj)
//     });
//     await this.increaseCountBySpec('blogSitePageViews', {
//         domain: obj.domain,
//         Ymd: this.makeYmd(obj)
//     });
// }

/**
 * Increase count by 1.
 * @param {*} colName collection name
 * @param {*} spec spec to create/update document under the collection
 * @param {extraSpect: object, unique: boolean } options options.
 */
// exports.increaseCountBySpec = async function (colName, spec) {
//     const re = await this.col(colName).find(spec).toArray();
//     let count = 0;
//     if (re.length) {
//         count = re[0].count;
//     }
//     count++;
//     await this.col(colName).updateOne(spec, {
//         $set: {
//             count: count
//         }
//     }, {
//         upsert: true
//     });
// }

/**
 * Increase by 1 on `count` of the document searched by the `spec`.
 * @desc if the logSpec is already exists more than 1, then it does not increase.
 * @param {*} colName collection name to increase count
 * @param {*} spec spec of the collection
 * @param {*} logSpec search spec to check if the spec exists in logs collection
 */
// exports.increaseCountOnUnique = async function ( colName, spec, logSpec) {
//     const searched = await this.col('logs').find(logSpec).toArray();
//     if ( searched.length === 1 ) {
//         await this.increaseCountBySpec( colName, spec );
//     }
// }

// exports.preProcessSiteVisitorByIP = async function (obj) {
//     await this.increaseCountOnUnique('rootSiteVisitorsByIp', {
//         Ymd: this.makeYmd(obj)
//     }, {
//         Ymd: this.makeYmd(obj),
//         ip: obj.ip
//     });
//     await this.increaseCountBySpec('blogSiteVisitorsByIp', {
//         domain: obj.domain,
//         Ymd: this.makeYmd(obj)
//     }, {
//         extraSpec: {
//             ip: obj.ip
//         },
//         unique: true
//     });

// }


// exports.dbCreateIndexes = async function () {
//     /**
//      * logs Indexes
//      */
//     await this.col('logs').createIndex({
//         domain: 1,
//         year: 1,
//         month: 1,
//         day: 1,
//         hour: 1
//     });
//     await this.col('logs').createIndex({
//         year: 1,
//         month: 1,
//         day: 1,
//         hour: 1
//     });
//     await this.col('logs').createIndex({
//         domain: 1,
//         time: 1,
//         ip: 1
//     });
//     await this.col('logs').createIndex({
//         time: 1,
//         ip: 1
//     });
//     await this.col('logs').createIndex({
//         domain: 1,
//         time: 1,
//         path: 1
//     });
//     await this.col('logs').createIndex({
//         time: 1,
//         path: 1
//     });
//     await this.col('logs').createIndex({
//         time: 1,
//         idx_member: 1
//     });

//     /**
//      * PageView Indexes
//      */
//     await this.col('rootSitePageViews').createIndex({
//         Ymd: 1
//     });
//     await this.col('blogSitePageViews').createIndex({
//         domain: 1,
//         Ymd: 1
//     });
//     await this.col('rootSiteVisitorsByIp').createIndex({
//         Ymd: 1
//     });
//     await this.col('blogSiteVisitorsByIp').createIndex({
//         domain: 1,
//         Ymd: 1
//     });

// }
// exports.col = function(name) {
//     return this.db.collection(name);
// }