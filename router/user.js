const express = require('express');

const userController = require('../controller/user')

const router = express.Router();

//login
router.route('/login')
    .get(userController.getLogin)
    .post(userController.postLogin)
//logout
router.route('/logout')
    .get(userController.getLogout)
    //.post(userController.postLogout)
//userInfo
router.route('/info')
    .get(userController.getInfo)
//AddUser
router.route('/userAdd')
    .post(userController.userAdd)
//updateUser
router.route('/updateUser')
    .post(userController.updateUser)
//deleteUser
router.route('/deleteUser')
    .post(userController.delete)

exports.routes = router;