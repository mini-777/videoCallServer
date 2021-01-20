var mysql = require('mysql');
var db_info = {
    host: 'videocalldb.cip9531xqh6o.ap-northeast-2.rds.amazonaws.com',
    port: '3306',
    user: 'admin',
    password: '05750575',
    database: 'videocall'
}

module.exports = {
    init: function () {
        return mysql.createConnection(db_info);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql connection error : ' + err);
            else console.log('mysql is connected successfully!');
        });
    }
}