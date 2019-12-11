const user = require('../model/user')
const board = require('../model/board')

exports.getIndex = async (req, res) => {
    const [rows] = await board.boardList()
    res.render('index', {
        "session" : req.session.user,
        "board" : rows
    });
}