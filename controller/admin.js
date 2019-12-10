const user = require('../model/user')

//  /admin
exports.getInfo = (req, res) => {
    console.log('admin session => ' + JSON.stringify(req.session.user))
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
// /admin/userManagement/:id
exports.userDetail = async (req, res) => {
    const { id } = req.params;
    const [rows] = await user.findById(id);

    res.render('admin/userDetail', {
        "session": req.session.user,
        "user": rows[0]
    });
}