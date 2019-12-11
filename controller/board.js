const user = require('../model/user')
const board = require('../model/board')

//  GET  /:id  =>render posts.html
exports.postsList = async (req, res) => {
    const boardId = req.params.id;
    const [rows] = await board.boardList();
    const [posts] = await board.postList(boardId);
    const [boardInfo] = await board.searchBoard(boardId);
    res.render('board/posts', {
        "session" : req.session.user,
        "board" : rows,
        "posts" : posts,
        "boardName" : boardInfo[0]
    })
}
//  GET/POST  /board/:id/addPost
exports.getAddPost = async (req, res) => {
    const { id } = req.params;
    const [rows] = await board.boardList();
    const [boardInfo] = await board.searchBoard(id);
    res.render('board/postAdd', {
        "session" : req.session.user,
        "board" : rows,
        "boardInfo" : boardInfo[0]
    })
}
exports.postAddPost = async (req, res) => {
    const id = req.params.id;
    const author = req.session.user.id;
    const { title, body} = req.body;
    await board.addPost( author, title, body, id);
    res.redirect(`/board/${id}`);
}
//  GET /board/:boardId/:postId
exports.detailPost = async (req, res) => {
    const { boardId, postId } = req.params;
    const [rows] = await board.boardList();
    const [boardInfo] = await board.searchBoard(boardId);
    const [postInfo] = await board.searchPost(postId);
    res.render('board/postDetail', {
        "session" : req.session.user,
        "board" : rows,
        "boardInfo" : boardInfo[0],
        "postInfo" : postInfo[0]
    })
    //아이디들과 정보를 얻어서 가져가겠음
    //res.render()
}
// POST /board/:boardId/:postId/update(delete)Post
exports.getUpdatePost = async (req, res) => {
    const { boardId, postId } = req.params;
    const [rows] = await board.boardList();
    const [boardInfo] = await board.searchBoard(boardId);
    const [postInfo] = await board.searchPost(postId);
    res.render('board/postUpdate', {
        "session" : req.session.user,
        "board" : rows,
        "boardInfo" : boardInfo[0],
        "postInfo" : postInfo[0]
    })

}
exports.postUpdatePost = async (req, res) => {
    const { title, body } = req.body;
    const { boardId, postId } = req.params;
    await board.updatePost(title, body, postId);
    res.redirect(`/board/${boardId}/${postId}`);
}

exports.deletePost = async (req, res) => {
    const { boardId, postId } = req.params;
    await board.deletePost(postId);
    res.redirect(`/board/${boardId}`);
}