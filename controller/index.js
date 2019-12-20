const board = require('../model/board');
const chat = require('../model/chat');

exports.getIndex = async (req, res) => {
    const [rows] = await board.boardList();
    const [crows] = await chat.chatList();
    res.render('index', {
        session: req.session.user,
        board: rows,
        chats: crows,
    });
}