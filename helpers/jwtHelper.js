const jwt = require('jsonwebtoken');
const { authConfig: { secretKey, expiresIn } = {} } = require('../config');

/**
 * Genarates A JWT Token
 * @param {object} payload - Valid Object To Be Wrapped As A Token
 * @param {string} - JWT Token 
 */
const generateToken = (payload) => {
    return jwt.sign(payload,
        secretKey,
        {
            expiresIn,
        }
    );
}

/**
 * Decodes A JWT Token
 * @param {string} - Valid JWT Token 
 * @returns {object} - Decoded Object
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token) || {};
    } catch (err) {
        console.log("Error While Decoding: ", err);
        throw err;
    }
}

module.exports = {
    decodeToken,
    generateToken,
}