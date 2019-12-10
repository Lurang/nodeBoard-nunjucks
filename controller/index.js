const user = require('../model/user')

exports.getIndex = (req, res) => {
    res.render('index', {
        "session" :req.session.user
    });
}