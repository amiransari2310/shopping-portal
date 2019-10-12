const express = require('express');
const router = express.Router();
const { productsController } = require('../controllers');
const {
    listProducts,
    createProduct,
    getProduct,
    updateProduct,
    removeProduct,
} = productsController;

router.route('/').get(listProducts);

router.route('/').post(createProduct);

router.route('/:id').get(getProduct);

router.route('/:id').put(updateProduct);

router.route('/:id').delete(removeProduct);

module.exports = router;