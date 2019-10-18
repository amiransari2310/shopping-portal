const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { authMiddleware } = require('../middlewares');
const {
    login,
    logout,
    register,
} = authController;

router.route('/register').post(register);

router.route('/login').post(login);

router.route('/logout').get(authMiddleware([]), logout);

module.exports = router;