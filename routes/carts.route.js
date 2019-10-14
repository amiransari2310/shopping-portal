const express = require('express');
const router = express.Router();
const { cartsController } = require('../controllers');
const {
    getCart,
    createOrupdateCart,
} = cartsController;

router.route('/').get(getCart)

router.route('/:op').post(createOrupdateCart);

module.exports = router;