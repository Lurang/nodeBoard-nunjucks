const argon2 = require('argon2');
const user = require('../model/user');

exports.getLogin = (req, res) => {
    res.render('user/login')
}
//loginCheck => setSession
exports.postLogin = async (req, res) => {
    const { id, password } = req.body;
    const [rows] = await user.login(id);
    //idCheck
    if (!rows[0]) {
        res.redirect(404, '/user/login');
        return;
    }
    //passwordCheck
    const result = await argon2.verify(rows[0].password, password);
    if (result === false) {
        res.send('password wrong');
        return;
    }
    //adminCheck
    let isAdmin = false;
    if (id === 'admin') {
        isAdmin = true;
    } else if (id === 'ADMIN') {
        res.send('error');
        return;
    }
    //set session
    req.session.user = {
        "id": id,
        "isValid": true,
        "admin": isAdmin
    }
    res.redirect('/')
}
//logOut => destroy session
exports.getLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}
//add new user
exports.userAdd = async (req, res) => {
    const { id, name, password } = req.body;
    const newUser = new user(id, name, password);
    await newUser.save()
    res.redirect('/')
}
// ??
exports.getInfo = async (req, res) => {
    const [rows] = await user.findById(req.session.user.id)
    
    res.render('user/userInfo', {
        "user" : rows[0],
        "session" : req.session.user     
    });
}
//  POST /user/updateUser
exports.updateUser = async (req, res) => {
    const { id, name } = req.body;
    await user.updateById(id, name) 
    if (req.session.user.admin) {
        res.redirect('/admin/userManagement');
    } else {
        res.redirect('/');
    }  
}
//  POST /user/deleteUser
exports.delete = async (req, res) => {
    const { id } = req.body;
    await user.deleteById(id)
    if (req.session.user.admin) {
        res.redirect('/admin/userManagement');
    } else {   
        req.session.destroy(() => {
            res.redirect('/')
        })
    }
}