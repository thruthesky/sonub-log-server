const MongoClient = require('mongodb').MongoClient;
var share = require('./share');
var db;
(async () => {
    db = await share.dbConnect();
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
    console.log('======> testData');
    const re = await db.collection('logs').find({}).toArray();
    share.expectToBeTrue(re.length == 1008*2, 'Test data generated');

    let error = false;
    for (var year of [2017, 2018, 2019]) {
        for (var month = 0; month <= 11; month++) {
            for (var day = 1; day < 29; day++) {
                const re = await db.collection('logs').find({
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
    console.log('======> testPreProcessingPageView');
    const spec = {
        year: '2018',
        month: 5,
        day: 5
    };

    const Ymd_spec = { Ymd: share.makeYmd(spec) };

    await db.collection('rootSitePageViews').deleteOne(Ymd_spec);
    let re = await db.collection('rootSitePageViews').find(Ymd_spec).toArray();
    
    share.expectToBeTrue( re.length == 0, 'Count does not exists on page view: 2018-05-05. result: ' + re.length);

    await share.preProcessPageView(spec);
    re = await db.collection('rootSitePageViews').find(Ymd_spec).toArray();
    // console.log(re);
    share.expectToBeTrue( re.length == 1, 'Count exists on page view: 2018-05-05');

    await share.preProcessPageView(spec);
    re = await db.collection('rootSitePageViews').find(Ymd_spec).toArray();
    share.expectToBeTrue( re.length == 1 && re[0].count == 2, 'Count on page view: 2018-05-05 must be 2 = ' + re[0].count);

    await share.preProcessPageView(spec);
    re = await db.collection('rootSitePageViews').find(Ymd_spec).toArray();
    share.expectToBeTrue( re.length == 1 && re[0].count == 3, 'Count on page view: 2018-05-05 must be 3 = ' + re[0].count);

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
    // console.log(res);
    share.expectToBeTrue( res.length == 1, "Should get 1 = got (" + res.length + ")  data of 2018-3-3");
    const r = res.pop();
    share.expectToBeTrue( r.Ymd == 20180303, 'Data correct' );
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
        function: 'siteUniqueVisitor',
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
    share.expectToBeTrue( res[0].count == 2, "siteUniqueVisitorsView:: Count must be 2 = got (" + res[0].count + ")  data of 2018-3-3");

    res = await db.collection('logs').find({ domain: req.domain, year: req.from_year, month:req.from_month, day: req.from_day }).toArray();
    share.expectToBeTrue( res.length == 2, 'there must be 2 record in logs. result: ' + res.length);
    
    req = {
        function: 'siteUniqueVisitor',
        from_year: 2018,
        from_month: 3,
        from_day: 3,
        to_year: 2018,
        to_month: 3,
        to_day: 5
    };
    res = await share.getStat({ query: req });
    share.expectToBeTrue( res.length == 3 && res[0].count == 2 && res[1].count == 2 && res[2].count == 2, "testVisitor should be 3 =  " + res.length + " and all count should be 2");
    
    res = await db.collection('logs').find({
        $and: [ { year: {$gte: req.from_year}, month: {$gte: req.from_month}, day: {$gte:  req.from_day} },
            { year: {$lte: req.to_year}, month: {$lte: req.to_month}, day: {$lte:  req.to_day} }]}).toArray();
    share.expectToBeTrue( res.length == 6, 'there should 6 record in logs. base on the count above.');
}