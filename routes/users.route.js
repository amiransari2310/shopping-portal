const express = require('express');
const router = express.Router();
const { usersController } = require('../controllers');
const {
    listUsers,
    createUser,
    getUser,
    updateUser,
    removeUser,
    login,
} = usersController;

router.route('/').get(listUsers);

router.route('/').post(createUser);

router.route('/:id').get(getUser);

router.route('/:id').put(updateUser);

router.route('/:id').delete(removeUser);

router.route('/login').post(login);

module.exports = router;