const express = require('express');

const adminController = require('../controller/admin')

const router = express.Router();

//routes
router.route('/')
    .get(adminController.getInfo)

router.route('/userManagement')
    .get(adminController.getUser)

router.route('/userManagement/:id')
    .get(adminController.userDetail)


exports.routes = router;