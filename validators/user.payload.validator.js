const Joi = require('@hapi/joi');

const schema = Joi.object({
    _id: Joi.string(),
    firstName: Joi.string().required(),
    lastName: Joi.string(),
    userName: Joi.string().required(),
    emailId: Joi.string().email(),
    mobileNumber: Joi.number(),
    password: Joi.string(),
    role: Joi.string().valid('admin', 'customer')
});

// Exporting Function That Validates User Paylod
module.exports = (payload) => schema.validate(payload);
