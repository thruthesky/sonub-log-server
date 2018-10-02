var share = require('./share');
var db;
(async () => {
    db = await share.dbConnect();
    await db.collection('logs').deleteMany({});
    await db.collection('rootSitePageViews').deleteMany({});
    await db.collection('blogSitePageViews').deleteMany({});
    await db.collection('rootSiteVisitorsByIp').deleteMany({});
    await db.collection('blogSiteVisitorsByIp').deleteMany({});
    await runTest();
    await share.dbClose();

})();

async function runTest() {
    await createTestData();

}


async function createTestData() {
    console.log('createTestData() ...');


    /**
     * Create test data with the following.
     *  domain: test-domain-*
     *  ip: 1.2.*.1-0
     *  userAgent: 'Android *',
     *  path: '/page-*'.
     *  idx_member: *
     *  date: 2018-1-1, 2018-2-2
     * 
     * '*' means from 1 to 12.
     */
    for (var year of [2017, 2018, 2019]) {
        for (var month = 0; month <= 11; month++) {
            for (var day = 1; day < 29; day++) {
                const obj = {
                    ip: `1.2.${month}.${day}`,
                    domain: `test-domain-${day}`,
                    userAgent: `Android ${day}`,
                    path: `/page-${year}-${month}-${day}`,
                    idx_member: month,
                    date: new Date(year, month, day, 5, day, day)
                };

                const socket = {
                    request: {
                        connection: {
                            remoteAddress: obj.ip
                        },
                        headers: {
                            'user-agent': obj.userAgent
                        }
                    }
                };
                const data = {
                    domain: obj.domain,
                    path: obj.path,
                    idx_member: obj.idx_member,
                    date: obj.date
                };

                console.log(month, day);
                await share.log(socket, data);
            }
        }
    }

    for (var year of [2017, 2018, 2019]) {
        for (var month = 0; month <= 11; month++) {
            for (var day = 1; day < 29; day++) {
                const obj = {
                    ip: `1.2.${month+20}.${day}`,
                    domain: `test-domain-${day}`,
                    userAgent: `Android ${day}`,
                    path: `/page-${year}-${month}-${day}`,
                    idx_member: month,
                    date: new Date(year, month, day, 5, day, day)
                };

                const socket = {
                    request: {
                        connection: {
                            remoteAddress: obj.ip
                        },
                        headers: {
                            'user-agent': obj.userAgent
                        }
                    }
                };
                const data = {
                    domain: obj.domain,
                    path: obj.path,
                    idx_member: obj.idx_member,
                    date: obj.date
                };

                console.log(month, day);
                await share.log(socket, data);
            }
        }
    }

    let re = await db.collection('logs').find({}).toArray();
    share.expectToBeTrue(re.length == 1008 * 2, `Test data generated: ${re.length}`);

    re = await db.collection('rootSitePageViews').find({}).toArray();
    share.expectToBeTrue(re.length == 1008, `Test data generated: ${re.length}`);

    re = await db.collection('blogSitePageViews').find({}).toArray();
    share.expectToBeTrue(re.length == 1008, `Test data generated: ${re.length}`);


    re = await db.collection('rootSiteVisitorsByIp').find({}).toArray();
    share.expectToBeTrue(re.length == 1008, `Test data generated: ${re.length}`);

    re = await db.collection('blogSiteVisitorsByIp').find({}).toArray();
    share.expectToBeTrue(re.length == 1008, `Test data generated: ${re.length}`);


}