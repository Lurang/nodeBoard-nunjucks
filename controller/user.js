const argon2 = require('argon2');

const user = require('../model/user');
const board = require('../model/board');

const postPerPage = 10;

exports.getLogin = (req, res) => {
    res.render('user/login');
}
//loginCheck => setSession
exports.postLogin = async (req, res) => {
    const {id, password} = req.body;
    const [rows] = await user.login(id);
    //idCheck
    if (!rows[0]) {
        res.json({
            message: 0,
        })
        return;
    };
    //passwordCheck
    //해쉬함수에 들어가기전에 password정책에따라 길이를검증한다던지, 하는게좋음
    //DDOS공격에 취약함 제약이없으면
    const result = await argon2.verify(rows[0].password, password);
    if (result === false) {
        res.json({
            message: 1,
        })
        return;
    };
    //adminCheck
    let isAdmin = false;
    if (id === 'admin') {
        isAdmin = true;
    } else if (id === 'ADMIN') {
        res.send('error');
        return;
    };
    //set session
    req.session.user = {
        id: id,
        isValid: true,
        admin: isAdmin,
    };
    //res.redirect('/')
    res.json({
        message: 3,
    });
}
//logOut => destroy session
exports.getLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
}
//add new user
exports.userAdd = async (req, res) => {
    const {id, name, password} = req.body;
    const newUser = new user(id, name, password);
    try {
        await newUser.save();
    } catch(err) {
        console.log(err);
        return res.json({
            state: err.sqlState,
        });
    };
    res.redirect('/');
}
// GET /user/info
exports.getInfo = async (req, res) => {
    let page = +req.query.page || 1;  //default = 1
    if (page <= 0) {
        page = 1;
    };
    const [[rows], [maxPost]] = await Promise.all([
        user.findById(req.session.user.id),
        board.maxUserPost(req.session.user.id),
    ]);
    //case over maxpage
    const maxPage = Math.ceil(maxPost[0].count / postPerPage);
    if (page > maxPage && maxPage !== 0) {
        page = maxPage;
    };
    const [posts] = await board.userPost(req.session.user.id, postPerPage, ((page - 1) * postPerPage));
    res.render('user/userInfo', {
        user: rows[0],
        session: req.session.user,
        posts: posts,
        maxPage: maxPage,
    });
}
//  POST /user/updateUser
exports.updateUser = async (req, res) => {
    const {id, name} = req.body;
    await user.updateById(id, name);
    if (req.session.user.admin) {
        res.redirect('/admin/userManagement');
    } else {
        res.redirect('/');
    };
}
//  POST /user/deleteUser
exports.delete = async (req, res) => {
    const {id} = req.body;
    await user.deleteById(id);
    if (req.session.user.admin) {
        res.redirect('/admin/userManagement');
    } else {
        req.session.destroy(() => {
            res.redirect('/');
        });
    };
}
//  POST /user/suCheck
exports.sighUpCheck = async (req, res) => {
    const {id} = req.body;
    const [row] = await user.checkId(id);
    if (row[0].count === 0) {
        res.json({
            id: 1, //can use id
        });
    } else {
        res.json({
            id: 0, //id already exist
        });
    };
}