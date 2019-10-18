const Joi = require('@hapi/joi');

const productsSchema = Joi.object().keys({
    productId: Joi.string().required(),
    quantity: Joi.number(),
    costPerUnit: Joi.number(),
});

const schema = Joi.object({
    products: Joi.array().items(productsSchema),
});

// Exporting Function That Validates Cart Paylod
module.exports = (payload) => schema.validate(payload);
