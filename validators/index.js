const validateUserPayload = require('./user.payload.validator');
const validateProductPayload = require('./product.payload.validator');
const validateCartPayload = require('./cart.payload.validator');

module.exports = {
    validateUserPayload,
    validateProductPayload,
    validateCartPayload,
}