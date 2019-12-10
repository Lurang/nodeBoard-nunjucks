const express = require('express');

const indexController = require('../controller/index')

const router = express.Router();

//index
router.route('/')
    .get(indexController.getIndex)

exports.routes = router;