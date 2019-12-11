const paginate = require('express-paginate');

const db = require('../util/database');

module.exports = class Board {
    /* about post */
    static postList (boardId) {
        return db.execute(`select post_id, author, post_title, post_body, date from board where board_id = ?`, [boardId]);
    }
    static addPost (author, title, body, boardId) {
        return db.execute(`insert into board (author, post_title, post_body, board_id) values (?, ?, ?, ?)`, [author, title, body, boardId]);
    }
    static searchPost (postId) {
        return db.execute(`select * from board where post_id = ?`, [postId]);
    }
    static deletePost (postId) {
        return db.execute(`delete from board where post_id = ?`, [postId]);
    }
    static postPage () {
        return db.execute(`select count(*) as cnt from products`);
    }
    static updatePost (title, body, postId) {
        return db.execute(`update board set post_title = ?, post_body = ? where post_id = ?`, [title, body, postId]);
    }

    /* about board */
    static boardList () {
       return db.execute(`select board_id, board_name from board_information`);
    }
    static searchBoard (id) {
        return db.execute(`select * from board_information where board_id = ?`, [id]);
    }
    static updateBoard (id, name, admin) {
        return db.execute(`update board_information set board_name = ?, admin = ? where board_id = ?`, [name, admin, id]);
    }
    static deleteBoard (id) {
        return db.execute(`delete from board_information where board_id = ?`, [id]);
    }
    static addBoard (name, admin) {
        return db.execute(`insert into board_information (admin, board_name) values (?, ?)`, [admin, name]);
    }
}