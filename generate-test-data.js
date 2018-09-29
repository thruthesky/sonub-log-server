var mongoose = require('mongoose');
var share = require('./share');


mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var logs = share.initMongoose();


run();


async function run() {
    await createTestData();
    mongoose.disconnect();
}

async function createTestData() {

    var testData = [{
            ip: '1.2.3.4',
            userAgent: 'Android',
            domain: 'test-domain-1',
            path: '/test-path-1',
            idx_member: 0,
            date: (new Date(2018, 01, 03, 10, 22, 33)).getTime()
        },
        {
            ip: '12.34.56.78',
            userAgent: 'Android',
            domain: 'test-domain-2',
            path: '/test-path-2',
            idx_member: 1,
            date: (new Date(2017, 01, 03, 10, 22, 33)).getTime()
        },
        {
            ip: '111.222.333.444',
            userAgent: 'iOS',
            domain: 'test-domain-1',
            path: '/test-path-2',
            idx_member: 1,
            date: (new Date(2016, 01, 03, 10, 22, 33)).getTime()
        }
    ];
    for (var data of testData) {
        var log = new logs(share.documentData({
            request: {
                connection: {
                    remoteAddress: data.ip
                },
                headers: {
                    'user-agent': data.userAgent
                }
            }
        }, {
            domain: data.domain,
            path: data.path,
            date: data.date
        }));
        await log.save()
    }


    /**
     * Create test data with
     *  domain: test-domain-*
     *  ip: 1.2.*.1-0
     *  userAgent: 'Android *',
     *  path: '/page-*'.
     *  idx_member: *
     *  date: 2018 1-10 1-10
     */
    for( var third = 1; third < 256; third ++ ) {
        for( var forth = 1; forth < 11; forth ++ ) {
            const obj = {
                ip: `1.2.${third}.${forth}`,
                domain: `test-domain-${third}`,
                userAgent: `Android ${third}`,
                path: `/page-${third}`,
                idx_member: third,
                date: new Date(2018, forth, forth, forth, forth,forth)
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

            var log = logs( share.documentData(socket, data));

            await log.save();
        }
    }

}