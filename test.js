var mongoose = require('mongoose');
var share = require('./share');


mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var logs = share.initMongoose();


run();


async function run() {
    await testPageView();
}





async function testPageView() {
    const req = {
        protocol: 'page-view',
        domain: 'test-domain-1',
        from_year: 2018,
        from_month: 2,
        from_day: 3,
        to_year: 2018,
        to_month: 5,
        to_day: 6
    };


    const res = share.statPageView( req );

    /// res ok or not.
}