var share = require('./share');



share.expectToBeTrue( share.makeYmd() === false, 'Empty param test');
share.expectToBeTrue( share.makeYmd({}) === false, 'Empty param test: {}');
share.expectToBeTrue( share.makeYmd({year: 2018}) === false, 'Wrong param test: year');
share.expectToBeTrue( share.makeYmd({year: 2018, month: 5}) === false, 'Wrong param test: year, month');
share.expectToBeTrue( share.makeYmd({ day: 31 }) === false, 'Wrong param test: day');

share.expectToBeTrue( share.makeYmd({ year: 2018, month: 5, day: 31 }) === '20180531', `Expect success: 20180531`);
share.expectToBeTrue( share.makeYmd({ year: 1, month: 2, day: 3 }) === '10203', `Expect success: ` + share.makeYmd({ year: 1, month: 2, day: 3 }));

var re = share.makeYmd({ year: 12345, month: 000, day: 123.5 });
share.expectToBeTrue( re === '1234500123.5', `Expect success: ${re}`);



(async () => {
    const db = await share.dbConnect();
    const colName = 'unit1';
    let col = db.collection(colName);
    await col.deleteMany({});
    await share.increaseCountBySpec(colName, { a: 'apple' });
    let re = await col.find({}).toArray();
    share.expectToBeTrue( re.length === 1, 'Must be one record.');
    share.expectToBeTrue( re[0].count === 1, 'Count must be 1');
    await share.increaseCountBySpec(colName, { a: 'apple' });
    re = await col.find({}).toArray();
    share.expectToBeTrue( re[0].count === 2, 'Count must be 2');




    // count unique
    // condition.
    //  - when log is saved, count must be computed.
    //      - it cannot be like this, "log save many times already. and then, count computed.".
    //      - If this happens, the test will fail.
    const socket = {
        request: {
            connection: {
                remoteAddress: 'unit-ip'
            },
            headers: {
                'user-agent': 'unit-agent'
            }
        }
    };
    const data = {
        domain: 'unit-dom',
        path: 'unit-path',
        idx_member: 0,
        date: new Date()
    };


    const ip = socket.request.connection.remoteAddress;
    const d = new Date();
    const Ymd = share.makeYmd({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() });
    const logs = db.collection('logs');
    const unitCol = db.collection('unit-col-ip');



    await logs.deleteMany({domain: 'unit-dom'});
    await unitCol.deleteMany({});

    await share.log(socket, data);


    const arrLogs = await logs.find({domain: 'unit-dom', Ymd: Ymd, ip: ip }).toArray();
    share.expectToBeTrue(arrLogs.length === 1, `Must be 1 after logging 1 records. result: ${arrLogs.length}`);


    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });

    re = await unitCol.find({Ymd: Ymd}).toArray();
    share.expectToBeTrue( re.length === 1, 'Must be 1. result : ' + re.length);
    share.expectToBeTrue( re[0].count === 1, 'Must be 1');



    await share.log(socket, data);
    const arrLogs2 = await logs.find({domain: 'unit-dom', Ymd: Ymd, ip: ip }).toArray();
    share.expectToBeTrue( arrLogs2.length === 2, `Must be 2 records after recording 2 records. result: ${arrLogs2.length}` );

    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });
    re = await unitCol.find({Ymd: Ymd}).toArray();
    share.expectToBeTrue( re.length === 1, `Must be 1 records on unit-col-ip because it increase by unique ip. result: ${re.length}`);
    share.expectToBeTrue( re[0].count === 1, `Must be 1 on the count of unit-col-ip because it did not increase due to the same ip. result: ${re[0].count}`);


    const ip2 = 'unit-ip-2'
    socket.request.connection.remoteAddress = ip2;
    await share.log(socket, data);
    const arrLogs3 = await logs.find({domain: 'unit-dom', Ymd: Ymd }).toArray();
    share.expectToBeTrue( arrLogs3.length === 3, `Must be 3 records in logs. result: ${arrLogs3.length}` );


    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip2 });
    re = await unitCol.find({Ymd: Ymd}).toArray();
    share.expectToBeTrue( re.length === 1, `Must be 1 records on unit-col-ip because it increase by unique ip. result: ${re.length}`);
    share.expectToBeTrue( re[0].count === 2, `Must be 2 on the count of unit-col-ip because ip changed. so, there is Two ips in total. result: ${re[0].count}`);


    // save 5 more records.
    await share.log(socket, data);
    await share.log(socket, data);
    await share.log(socket, data);
    await share.log(socket, data);
    await share.log(socket, data);

    const arrLogs8 = await logs.find({domain: 'unit-dom', Ymd: Ymd }).toArray();
    share.expectToBeTrue( arrLogs8.length === 8, `Must be 8 records in logs. result: ${arrLogs8.length}` );

    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip2 });
    re = await unitCol.find({Ymd: Ymd}).toArray();
    share.expectToBeTrue( re.length === 1, `Must be 1 records on unit-col-ip because it increase by unique ip. result: ${re.length}`);
    share.expectToBeTrue( re[0].count === 2, `Must be 2 on the count of unit-col-ip because ip changed. so, there is Two ips in total. result: ${re[0].count}`);



    // save ip again
    socket.request.connection.remoteAddress = ip;
    await share.log(socket, data);
    const arrLogs9 = await logs.find({domain: 'unit-dom', Ymd: Ymd }).toArray();
    share.expectToBeTrue( arrLogs9.length === 9, `Must be 9 records in logs. result: ${arrLogs9.length}` );


    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });
    re = await unitCol.find({Ymd: Ymd}).toArray();
    share.expectToBeTrue( re.length === 1, `Must be 1 records on unit-col-ip because it increase by unique ip. result: ${re.length}`);
    share.expectToBeTrue( re[0].count === 2, `Must be 2 on the count of unit-col-ip because ip changed. so, there is Two ips in total. result: ${re[0].count}`);



    // increase ip many times.

    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });
    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });
    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });
    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });
    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });
    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });
    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });
    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });
    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });
    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip });

    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip2 });
    await share.increaseCountOnUnique('unit-col-ip', { Ymd: Ymd }, { Ymd: Ymd, ip: ip2 });

    re = await unitCol.find({Ymd: Ymd}).toArray();
    share.expectToBeTrue( re.length === 1, `Must be 1 records on unit-col-ip because it increase by unique ip. result: ${re.length}`);
    share.expectToBeTrue( re[0].count === 2, `Must be 2 on the count of unit-col-ip because ip changed. so, there is Two ips in total. result: ${re[0].count}`);





    await share.dbClose();
})();

