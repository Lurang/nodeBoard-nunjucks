const express = require('express');

const boardController = require('../controller/board')

const router = express.Router();

    //해당게시판    
router.route('/:boardId')
    .get(boardController.postsList)
    //new
router.route('/:boardId/addPost')
    .get(boardController.getAddPost)
    .post(boardController.postAddPost)

    //해당항목  
router.route('/:boardId/:postId')
    .get(boardController.detailPost)
    //update,delete
router.route('/:boardId/:postId/updatePost')
    .get(boardController.getUpdatePost)
    .post(boardController.postUpdatePost)
router.route('/:boardId/:postId/deletePost')
    .post(boardController.deletePost)
    //comment
router.route('/:boardId/:postId/addComment')
    .post(boardController.addComment)
    //delete comment
router.route('/:boardId/:postId/deleteComment/:commentId')
    .post(boardController.deleteComment)
    
exports.routes = router;