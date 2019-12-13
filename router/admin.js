const express = require('express');

const adminController = require('../controller/admin')

const router = express.Router();

// routes
router.route('/')
    .get(adminController.getInfo)
// show users
router.route('/userManagement')
    .get(adminController.getUser)
// modify or delete user where id
router.route('/userManagement/:id')
    .get(adminController.userDetail)
// show boards
router.route('/boardManagement')
    .get(adminController.boardManagement)
// modify or delete board where id
router.route('/boardManagement/:id')
    .get(adminController.boardDetail)
// updateBoard
router.route('/boardUpdate')
    .post(adminController.boardUpdate)
// deleteBoard
router.route('/boardDelete')
    .post(adminController.boardDelete)
// addBoard
router.route('/boardAdd')
    .get(adminController.getBoardAdd)
    .post(adminController.postBoardAdd)
    
exports.routes = router;