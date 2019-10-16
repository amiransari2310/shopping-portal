const Joi = require('@hapi/joi');

const schema = Joi.object({
    _id: Joi.string(),
    firstName: Joi.string().required(),
    lastName: Joi.string(),
    userName: Joi.string().required(),
    emailId: Joi.string().email(),
    mobileNumber: Joi.number(),
    password: Joi.string(),
});

module.exports = (payload) => schema.validate(payload);
