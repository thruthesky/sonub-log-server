var share = require('./share');
var col;
(async () => {
    col = await share.dbConnect();
    await col.deleteMany({});
    await runTest();
    share.dbClose();
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

    const re = await col.find({}).toArray();
    share.expectToBeTrue(re.length == 1008, `Test data generated: ${re.length}`);
}