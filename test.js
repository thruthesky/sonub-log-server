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
    await testPreProcessingPageView();
    await testPageView();
    await testVisitor();
}



async function testData() {
    const re = await col.logs.find({}).toArray();
    share.expectToBeTrue(re.length == 1008*2, 'Test data generated');

    let error = false;
    for (var year of [2017, 2018, 2019]) {
        for (var month = 0; month <= 11; month++) {
            for (var day = 1; day < 29; day++) {
                const re = await col.logs.find({
                    year: year,
                    month: month,
                    day: day
                }).toArray();
                if ( re.length != 2 ) {
                    error = true;
                    break;
                }
            }
        }
    }

    share.expectToBeTrue( error == false, `Checking all the test data...` );
}



async function testPreProcessingPageView() {

    const spec = {
        year: 2018,
        month: 05,
        day: 05,
    };

    await col.pageViews.deleteOne(spec);
    let re = await col.pageViews.find(spec).toArray();
    
    share.expectToBeTrue( re.length == 0, 'Count does not exists on page view: 2018-05-05');

    await share.preProcessPageView(spec);
    re = await col.pageViews.find(spec).toArray();
    share.expectToBeTrue( re.length == 1, 'Count exists on page view: 2018-05-05');

    await share.preProcessPageView(spec);
    re = await col.pageViews.find(spec).toArray();
    share.expectToBeTrue( re.length == 1 && re[0].count == 4, 'Count on page view: 2018-05-05 must be 4 = ' + re[0].count);

    await share.preProcessPageView(spec);
    re = await col.pageViews.find(spec).toArray();
    share.expectToBeTrue( re.length == 1 && re[0].count == 6, 'Count on page view: 2018-05-05 must be 6 = ' + re[0].count);


}


async function testPageView() {
    console.log('======> testPageView');
    let req = {
        function: 'pageView',
        domain: 'test-domain-3',
        from_year: 2018,
        from_month: 3,
        from_day: 3,
        to_year: 2018,
        to_month: 3,
        to_day: 3
    };
    let res = await share.getStat({ query: req });
    share.expectToBeTrue( res.length == 1, "Should get 1 = got (" + res.length + ")  data of 2018-3-3");
    const r = res.pop();
    share.expectToBeTrue( r.year == 2018 && r.month == 3 && r.day == 3, 'Data correct' );
    share.expectToBeTrue( typeof r._id == 'undefined', 'Yeap! no _id on result');


    req = {
        function: 'pageView',
        from_year: 2018,
        from_month: 3,
        from_day: 3,
        to_year: 2018,
        to_month: 3,
        to_day: 5
    };
    res = await share.getStat({ query: req });
    share.expectToBeTrue( res.length == 3, "Got " + res.length + " docs");
}


async function testVisitor() {
    console.log('======> testVisitor');
    let req = {
        function: 'siteUniqueVisitorsView',
        domain: 'test-domain-3',
        from_year: 2018,
        from_month: 3,
        from_day: 3,
        to_year: 2018,
        to_month: 3,
        to_day: 3
    };
    let res = await share.getStat({ query: req });
    share.expectToBeTrue( res.length == 1, "Result must be 1 = got (" + res.length + ")  data of 2018-3-3");
    share.expectToBeTrue( res[0].count == 2, "Count must be 2 = got (" + res[0].count + ")  data of 2018-3-3");
    
    
    req = {
        function: 'siteUniqueVisitorsView',
        from_year: 2018,
        from_month: 3,
        from_day: 3,
        to_year: 2018,
        to_month: 3,
        to_day: 5
    };
    res = await share.getStat({ query: req });
    share.expectToBeTrue( res.length == 3 && res[0].count == 2 && res[1].count == 2 && res[2].count == 2, "testVisitor should be 3 =  " + res.length + " and all count should be 2");
}