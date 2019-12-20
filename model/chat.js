const db = require('../util/database');

module.exports = class Chat {
    static chatList() {
       return db.execute(`
       select * from
       (select author, body, date from chat order by date desc limit 50)
       as a order by date asc
       `);
    }
    static addChat(author, body) {
        return db.execute(`insert into chat (author, body) values (?, ?)`, [author, body])
    }
};