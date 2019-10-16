const { validateUserPayload, validateProductPayload, validateCartPayload } = require('../validators');

const validate = (payload, entity) => {
    let validationResponse;
    switch (entity) {
        case 'users':
            validationResponse = validateUserPayload(payload);
            break;
        case 'products':
            validationResponse = validateProductPayload(payload);
            break;
        case 'carts':
            validationResponse = validateCartPayload(payload);
            break;
        default:
            validationResponse = {};
    }
    return validationResponse;
}

module.exports = {
    validate,
};