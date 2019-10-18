const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartsSchema = new Schema({
    user: {
        type: String,
        required: true,
    },
    products: [{
        productId: {
            type: String,
        },
        quantity: {
            type: Number,
        },
        costPerUnit: {
            type: Number,
        },
        cost: {
            type: Number,
        }
    }],
    totalCost: {
        type: Number,
    }
});

module.exports = mongoose.model('carts', cartsSchema, 'carts');
