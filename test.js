const MongoClient = require('mongodb').MongoClient;
var share = require('./share');
var col;
(async () => {
    col = await share.dbConnect();
    await runTest();
    share.dbClose();
})();


async function runTest() {
    await testData();
    await testPageView();
}



async function testData() {
    const re = await col.find({}).toArray();
    share.expectToBeTrue(re.length == 1008, 'Test data generated');

    let error = false;
    for (var year of [2017, 2018, 2019]) {
        for (var month = 0; month <= 11; month++) {
            for (var day = 1; day < 29; day++) {
                const re = await col.find({
                    year: year,
                    month: month,
                    day: day
                }).toArray();
                if ( re.length != 1 ) {
                    error = true;
                    break;
                }
            }
        }
    }

    share.expectToBeTrue( error == false, `Checking all the test data...` );
}


async function testPageView() {
    const req = {
        function: 'pageView',
        domain: 'test-domain-1',
        from_year: 2018,
        from_month: 3,
        from_day: 3,
        to_year: 2018,
        to_month: 3,
        to_day: 3
    };

    const res = await share.getStat(req);

    // console.log('r: ', res);

    /// res ok or not.
    // console.log("res: ", res.length);

    share.expectToBeTrue( res.length == 1, "Got data of 2018-3-3");
    const r = res.pop();
    share.expectToBeTrue( r.year == 2018 && r.month == 3 && r.day == 3, 'Data correct' );
}