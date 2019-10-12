const jwt = require('jsonwebtoken');
const { authConfig: { secretKey, expiresIn } = {} } = require('../config');

const generateToken = (payload) => {
    return jwt.sign(payload,
        secretKey,
        {
            expiresIn,
        }
    );
}

const decodeToken = (token) => {
    let decodedToken = null;
    try {
        decodedToken = jwt.verify(token, secretKey);
    } catch (err) {
        console.log("Error While Decoding: ", err);
    }
    return decodedToken;
}

module.exports = {
    decodeToken,
    generateToken,
}