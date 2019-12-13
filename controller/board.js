const board = require('../model/board')

const postPerPage = 10;

//  GET  /:boardId  =>render posts.html
exports.postsList = async (req, res) => {
    const { boardId } = req.params;
    let page = req.query.page || 1;  //default = 1
    if( page <= 0 ) {
        page = 1;
    }
    const [[maxPost], [rows], [boardInfo]] = await Promise.all([
        board.maxPost(boardId),
        board.boardList(),
        board.searchBoard(boardId),
    ])
    if (boardInfo[0] === undefined) {
        return res.redirect('/')
    }
    const maxPage = Math.ceil(maxPost[0].count / postPerPage);
    if (page > maxPage && maxPage != 0) {
        page = maxPage;
    }
    const [posts] = await board.postList(boardId, postPerPage, ((page - 1) * postPerPage))
    res.render('board/posts', {
        "session" : req.session.user,
        "board" : rows,
        "posts" : posts,
        "boardName" : boardInfo[0],
        "page" : {
            "maxPage" : maxPage,
            "currentPage" : page,
            "index" : (page - 1) * postPerPage
        }
    })
}
//  GET/POST  /board/:boardId/addPost
exports.getAddPost = async (req, res) => {
    const page = req.query.page || 1;
    if( page <= 0 ) {
        page = 1;
    }
    const { boardId } = req.params;
    if(!req.session.user) {
        return res.redirect(`/board/${ boardId }`);
    }
    const [rows] = await board.boardList();
    const [boardInfo] = await board.searchBoard(boardId);

    if (boardInfo[0] === undefined) {
        return res.redirect('/')
    }
    if(boardInfo[0].admin && !req.session.user.admin) {
        return res.redirect(`/board/${ boardId }`);
    }
    res.render('board/postAdd', {
        "session" : req.session.user,
        "board" : rows,
        "boardInfo" : boardInfo[0],
        "page" : page
    })
}
exports.postAddPost = async (req, res) => {
    const page = req.query.page || 1;
    const { boardId } = req.params;
    const author = req.session.user.id;
    const { title, body} = req.body;
    let test = title;
    if(test.trim() !== '') {
        await board.addPost(author, title, body, boardId);
    }
    res.redirect(`/board/${ boardId }?page=${ page }`);
}
//  GET /board/:boardId/:postId
exports.detailPost = async (req, res) => {
    const page = req.query.page || 1 ;
    if( page <= 0 ) {
        page = 1;
    }
    const { boardId, postId } = req.params;
    const [[rows], [boardInfo], [postInfo], [comment]] = await Promise.all([
        board.boardList(),
        board.searchBoard(boardId),
        board.searchPost(postId),
        board.getComment(postId)
    ])
    if (boardInfo[0] === undefined) {
        return res.redirect('/')
    }
    res.render('board/postDetail', {
        "session" : req.session.user,
        "board" : rows,
        "boardInfo" : boardInfo[0],
        "postInfo" : postInfo[0],   
        "page" : page,
        "comment" : comment
    })
}
//  GET /board/:boardId/:postId/updatePost
exports.getUpdatePost = async (req, res) => {
    const page = req.query.page || 1;
    if( page <= 0 ) {
        page = 1;
    }
    const { boardId, postId } = req.params;
    const sess = req.session.user;
    if(!sess) {
        return res.redirect(`/board/${ boardId }/${ postId }?page=${ page }`);
    }
    const [rows] = await board.boardList();
    const [info] = await board.searchBoardPostbyPostId(postId)
    if(!sess.admin && sess.id !== info[0].author) {
        return res.redirect(`/board/${ boardId }/${ postId }?page=${ page }`);
    }
    /* 
    const [[rows], [info]] = await Promise.all([
        board.boardList(),
        board.searchBoardPostbyPostId(postId)
    ])
    */
    res.render('board/postUpdate', {
        "board" : rows,
        "session" : sess,
        "info" : info[0],
        "page" : page
    })
}
//  POST /board/:boardId/:postId/update(delete)Post
exports.postUpdatePost = async (req, res) => {
    const page = req.query.page || 1;
    const { title, body } = req.body;
    const { boardId, postId } = req.params;
    await board.updatePost(title, body, postId);
    res.redirect(`/board/${ boardId }/${ postId }?page=${ page }`);
}
exports.deletePost = async (req, res) => {
    const page = req.query.page || 1;
    const { boardId, postId } = req.params;
    await board.deletePost(postId);
    res.redirect(`/board/${ boardId }?page=${ page }`);
}
//  POST /board/:boardId/:postId/addComment?page={{ page }}
exports.addComment = async (req, res) => {
    const page = req.query.page || 1;
    const { comment } = req.body;
    const { id } = req.session.user;
    const { boardId, postId } = req.params;
    if( comment.trim() !== '') {
        await board.addComment(comment, postId, id);
    }
    res.redirect(`/board/${boardId}/${postId}?page=${page}`);
}   
//  POST /board/:boardId/:postId/deleteComment/:commentId?page={{ page }}
exports.deleteComment = async (req, res) => {
    const page = req.query.page || 1;
    const { boardId, postId, commentId } = req.params;
    await board.deleteComment(commentId);
    res.redirect(`/board/${boardId}/${postId}?page=${page}`);
}