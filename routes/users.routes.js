const express = require('express');
const router = express.Router();
const { usersController } = require('../controllers');
const {
    listUsers,
    getUser,
    updateUser,
    removeUser,
} = usersController;

router.route('/').get(listUsers);

router.route('/:id').get(getUser);

router.route('/:id').put(updateUser);

router.route('/:id').delete(removeUser);

module.exports = router;