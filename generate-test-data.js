var share = require('./share');

createTestData();

function createTestData() {

    share.connection.query("DELETE FROM logs WHERE id='lancelynyrd'", function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
    });

    // for (var year of [2017, 2018, 2019]) {
        [2017, 2018, 2019].forEach( function(year) {
            for (var month = 1; month <= 12; month++) {
                for (var day = 1; day < 29; day++) {
                    for(var n = 1; n < month+day; n++ ) {

                        var logObject =  {
                            YmdHis: year + share.add0(month) + share.add0(day) + 123456,
                            domain: 'b',
                            ip: '127.' + month + '.' + day + '.' + Math.round(n/3),
                            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
                            referrer: 'https://pinedaclp.sonub.com:8443/blog-stat/visitor',
                            path: '/blog-stat/visitor',
                            idx_member: '109425',
                            id: 'lancelynyrd',
                            lang: 'en',
                            status: ''
                        };

                        share.connection.query('INSERT INTO logs SET ? ', logObject, function (error, results, fields) {
                            if (error) throw error;
                            // console.log('The solution is: ', results);
                        });
                    }

                }

            }
        });
    // }

}
