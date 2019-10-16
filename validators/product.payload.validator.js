const Joi = require('@hapi/joi');

const schema = Joi.object({
    _id: Joi.string(),
    productId: Joi.string().required(),
    name: Joi.string().required(),
    costPrice: Joi.number().required(),
    sellingPrice: Joi.number().required(),
    stock: Joi.number().min(1).required(),
});

module.exports = (payload) => schema.validate(payload);
