const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'lurang',
    database: 'node',
    password: 'wnsgh'
});

module.exports = pool.promise();


/*
    host                : 'localhost',
    port                : 3306,
    user                : 'lurang',
    password            : 'wnsgh',
    database            : 'node',
    secret              : 'a',
    resave              : false,
    saveUninitialized   : false,
    createDatabaseTable : true,
    schema              : {
        tableName: 'sessions',
        columNames: {
            session_id  : 'session_id',
            expires     : 'expires',
            data        : 'data'
        }
    }
*/