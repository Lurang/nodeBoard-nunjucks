const express = require('express');

const boardController = require('../controller/board')

const router = express.Router();

/*
router.route('/')
    .get(boardController.getIndex)
*/
    //해당게시판    
router.route('/:id')
    .get(boardController.postsList)
    //new
router.route('/:id/addPost')
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
exports.routes = router;