const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const {
    login,
    logout,
} = authController;

router.route('/login').post(login);

router.route('/logout').get(logout);

module.exports = router;