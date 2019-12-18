const db = require('../util/database');

module.exports = class Board {
    /* about post */
    // 해당게시판의 총post양
    static maxPost(boardId) {
        return db.execute(`select count(*) count from board where board_id = ?`, [boardId]);
    }
    //해당게시판의 총post들
    static postList(boardId, first, last) {
        return db.execute(`
        select R1.*, R2.countn, ifnull(countn, 0) count
        from (
            select * from board where board_id = ? order by post_id asc
        ) R1 left join (
            select post_id pi, count(post_id) countn from comment group by post_id
        ) R2 on R2.pi = R1.post_id limit ? offset ?`, [boardId, first, last]);
    }
    //해당게시판에 post추가
    static addPost(author, title, body, boardId) {
        return db.execute(`insert into board (author, post_title, post_body, board_id) values (?, ?, ?, ?)`, [author, title, body, boardId]);
    }
    //해당포스트 검색
    static searchPost(postId) {
        return db.execute(`select * from board where post_id = ?`, [postId]);
    }
    //해당포스트 삭제
    static deletePost(postId) {
        return db.execute(`delete from board where post_id = ?`, [postId]);
    }
    //해당포스트 수정
    static updatePost(title, body, postId) {
        return db.execute(`update board set post_title = ?, post_body = ? where post_id = ?`, [title, body, postId]);
    }
    //해당유저가 작성한 글 by paging
    static userPost(author, first, last) {
        return db.execute(`
        select R1.*, R2.countn, ifnull(countn, 0) count from (
            select b.board_name, a.* from board_information b, board a where a.author = ? and a.board_id = b.board_id order by date asc
        ) R1 left join (
            select post_id pi, count(post_id) countn from comment group by post_id
        ) R2 on R1.post_id = R2.pi  limit ? offset ?`, [author, first, last]);
    }
    // 갯수
    static maxUserPost(author) {
        return db.execute(`select count(*) count from (
            select a.post_id from board_information b, board a where a.author = ? and a.board_id = b.board_id
        ) R1`, [author])
    }

    /* about board */
    static boardList() {
       return db.execute(`select board_id, board_name from board_information`);
    }
    static searchBoard(id) {
        return db.execute(`select * from board_information where board_id = ?`, [id]);
    }
    static updateBoard(id, name, admin) {
        return db.execute(`update board_information set board_name = ?, admin = ? where board_id = ?`, [name, admin, id]);
    }
    static deleteBoard(id) {
        return db.execute(`delete from board_information where board_id = ?`, [id]);
    }
    static addBoard(name, admin) {
        return db.execute(`insert into board_information (admin, board_name) values (?, ?)`, [admin, name]);
    }
    static countPost(boardId) {
        return db.execute(`select count(*) count from (
            select a.* from board_information b, board a where b.board_id = ? and b.board_id = a.board_id
        ) R1`, [boardId]);
    }
    
    /* about comment */
    static addComment(author, postId, comment, group_id, pid) {
        return db.execute(`insert into comment (comment_author, post_id, comment_body, group_id, pid) values (?, ?, ?, ?, ?) `, [author, postId, comment, group_id, pid]);
    }
    static addParentComment(author, postId, comment) {
        return db.execute(`insert into comment (comment_author, post_id, comment_body) values (?, ?, ?) `, [author, postId, comment]);
    }
    static getComment(postId) {
        return db.execute(`
        select R1.comment_id, R1.post_id, R1.comment_author, R1.comment_body, R1.date, R1.group_id, R1.pid, ifnull(R2.author, '') author from (    
            select comment_id, post_id, comment_author, comment_body, date, ifnull(group_id, comment_id) group_id, ifnull(pid, 0) pid from comment
        ) R1 left join ( 
            select T2.comment_author author, T1.comment_id from comment T1 inner join comment T2 on T1.pid = T2.comment_id
        ) R2 
        on R1.comment_id = R2.comment_id where R1.post_id = ?
        order by group_id asc, comment_id asc;
        `, [postId]);
    }
    static deleteComment(commentId) {
        return db.execute(`delete from comment where comment_id = ?`, [commentId]);
    }

    /*     mix     */
    static searchBoardPostbyPostId(postId) {
        return db.execute(`select a.*, b.* from board_information a, board b where b.post_id = ? and a.board_id = b.board_id`, [postId]);
    }
}