var share = require('./share');
var col;
(async () => {
    await share.dbConnect();
    col = share.cols;
    await col.logs.deleteMany({});
    await col.rootSitePageViews.deleteMany({});
    await col.blogSitePageViews.deleteMany({});
    await col.rootSiteVisitorsByIp.deleteMany({});
    await col.blogSiteVisitorsByIp.deleteMany({});
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

    let re = await col.logs.find({}).toArray();
    share.expectToBeTrue(re.length == 1008 * 2, `Test data generated: ${re.length}`);

    re = await col.rootSitePageViews.find({}).toArray();
    share.expectToBeTrue(re.length == 1008, `Test data generated: ${re.length}`);

    re = await col.blogSitePageViews.find({}).toArray();
    share.expectToBeTrue(re.length == 1008, `Test data generated: ${re.length}`);


    re = await col.rootSiteVisitorsByIp.find({}).toArray();
    share.expectToBeTrue(re.length == 1008, `Test data generated: ${re.length}`);

    re = await col.blogSiteVisitorsByIp.find({}).toArray();
    share.expectToBeTrue(re.length == 1008, `Test data generated: ${re.length}`);


}