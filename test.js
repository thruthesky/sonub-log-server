const share = require('./share');

console.log(share.db);



const socket = {
    request: {
        connection: {
            remoteAddress: '192.168.88.3'
        },
        headers: {
            'user-agent': 'this is user agent',
            'referer': 'this is referer!'
        }
    }
};
const data = {
    domain: 'abc',
    path: 'this is path',
    idx_member: 8,
    id: 'userid'
};

share.log(socket, data);
