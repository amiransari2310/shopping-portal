const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productsSchema = new Schema({
    productId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    costPrice: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        min: 1,
    },
});

module.exports = mongoose.model('products', productsSchema, 'products');
