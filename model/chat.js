const db = require('../util/database');

module.exports = class Chat {
    static chatList() {
        return db.execute(`
            select author, body, date from
            (select author, body, date from chat order by date desc limit 50)
            as a order by date asc
        `);
    };
    static addChat(author, body) {
        return db.execute(`
            insert into chat (author, body) values (?, ?)
        `, [author, body]);
    };
    static lastChats(author, body, chat_id) {
        return db.execute(`
            select chat_id, author,body, date from chat where chat_id >= (
                select chat_id from chat where author = ? and body = ? and chat_id = ? order by chat_id desc limit 1
            )
        `, [author, body, chat_id]);
    };
    static lastChatId() {
        return db.execute(`
            select chat_id from chat order by chat_id desc limit 1
        `);
    };
};