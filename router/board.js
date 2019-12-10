const express = require('express');

const boardController = require('../controller/board')

const router = express.Router();

router.route('/')
    .get(boardController.getIndex)
//목록
router.route('/posts')
    .get(boardController.getPost)
//해당항목
router.route('/posts/:id')
    .get(boardController.detailPost)
//new
router.route('/newPost')
    .get(boardController.newPost)
    .post(boardController.addPost)

exports.routes = router;