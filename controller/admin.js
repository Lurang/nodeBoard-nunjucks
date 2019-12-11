const user = require('../model/user');
const board = require('../model/board');

//  /admin
exports.getInfo = (req, res) => {
    res.render('admin/admin', {
        "session" :req.session.user
    });
}
//  /admin/userManagement
exports.getUser = async (req, res) => {
    const [rows] = await user.fetchAll();

    res.render('admin/users', {
        users: rows,
        "session": req.session.user
    });
}
//  /admin/userManagement/:id
exports.userDetail = async (req, res) => {
    const { id } = req.params;
    const [rows] = await user.findById(id);

    res.render('admin/userDetail', {
        "session" : req.session.user,
        "user" : rows[0]
    });
}
//  /admin/boardManagement
exports.boardManagement = async (req, res) => {
    const [rows] = await board.boardList();

    res.render('admin/boardManagement', {
        "session" : req.session.user,
        "board" : rows,
    })
}
// /admin/boardManagement/:id
exports.boardDetail = async (req, res) => {
    const { id } = req.params
    const [rows] = await board.searchBoard(id);

    res.render('admin/boardDetail', {
        "session" : req.session.user,
        "board" : rows[0],
    })
}
//  /admin/boardUpdate
exports.boardUpdate = async (req, res) => {
    let { id, admin, name } = req.body;
    if ( !admin ) {
        admin = 0;
    }
    await board.updateBoard(id, name, admin);

    res.redirect('/admin/boardManagement');
}
//  /admin/boardDelete
exports.boardDelete = async (req, res) => {
    const { id } = req.body;
    await board.deleteBoard(id);

    res.redirect('/admin/boardManagement');
}
//  /admin/boardAdd
exports.getBoardAdd = (req, res) => {
    res.render('admin/boardAdd', {
        "session" : req.session.user,
    });
}
exports.postBoardAdd = async (req, res) => {
    let { name, admin } = req.body;
    if ( !admin ) {
        admin = 0;
    }
    await board.addBoard(name, admin);

    res.redirect('/admin/boardManagement');
}