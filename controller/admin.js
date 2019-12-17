const user = require('../model/user');
const board = require('../model/board');

const postPerPage = 10;

//  /admin
exports.getInfo = (req, res) => {
    res.render('admin/admin', {
        session: req.session.user,
    });
}
//  /admin/userManagement
exports.getUser = async (req, res) => {
    const [rows] = await user.fetchAll();
    res.render('admin/userManagement', {
        users: rows,
        session: req.session.user,
    });
}
//  /admin/userManagement/:id
exports.userDetail = async (req, res) => {
    const {id} = req.params;
    let page = +req.query.page || 1;
    if (page <= 0) {
        page = 1;
    };
    const [[rows], [maxPost]] = await Promise.all([
        user.findById(id),
        board.maxUserPost(id),
    ]);
    const maxPage = Math.ceil(maxPost[0].count / postPerPage);
    if (page > maxPage && maxPage !== 0) {
        page = maxPage;
    };
    const [posts] = await board.userPost(id, postPerPage, ((page - 1) * postPerPage));
    res.render('admin/userDetail', {
        session: req.session.user,
        user: rows[0],
        posts: posts,
        maxPage: maxPage,
    });
}

//   --  board  --   

//  /admin/boardManagement
exports.boardManagement = async (req, res) => {
    const [rows] = await board.boardList();
    res.render('admin/boardManagement', {
        session: req.session.user,
        board: rows,
    });
}
// /admin/boardManagement/:id
exports.boardDetail = async (req, res) => {
    const {id} = req.params;
    const [[rows], [count]] = await Promise.all([
        board.searchBoard(id),
        board.countPost(id),
    ]);
    res.render('admin/boardDetail', {
        session: req.session.user,
        board: rows[0],
        count: count[0],
    });
}
//  /admin/boardUpdate
exports.boardUpdate = async (req, res) => {
    let {id, admin, name} = req.body;
    if (!admin) {
        admin = 0;
    };
    await board.updateBoard(id, name, admin);
    res.redirect('/admin/boardManagement');
}
//  /admin/boardDelete
exports.boardDelete = async (req, res) => {
    const {id} = req.body;
    await board.deleteBoard(id);
    res.redirect('/admin/boardManagement');
}
//  /admin/boardAdd
exports.getBoardAdd = (req, res) => {
    res.render('admin/boardAdd', {
        session: req.session.user,
    });
}
exports.postBoardAdd = async (req, res) => {
    let { name, admin } = req.body;
    if (!admin) {
        admin = 0;
    };
    await board.addBoard(name, admin);
    res.redirect('/admin/boardManagement');
}