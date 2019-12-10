const user = require('../model/user')

exports.getIndex = (req, res) => {
    res.render('board/posts', {
        "session" : req.session.user
    })
}
//  GET /board/posts
exports.getPost = (req, res) => {
    
}
//  GET /board/posts/:id
exports.detailPost = (req, res) => {
    const { id } = req.params;
    res.send(id);
}
//  GET /board/newPost
exports.newPost = (req, res) => {
    
}
//  POST /board/newPost
exports.addPost = (req, res) => {
    
}