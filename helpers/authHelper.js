const bcrypt = require('bcrypt');

/**
 * Return User Object From Request
 * @param {object} req - HTTP Express Request Object
 * @param {object} user - User Object With User Details 
 */
const getUserObject = (req) => {
    const { user = {} } = req;
    return user;
}

/**
 * Hash Plain Text Password
 * @param {string} password - Plain Text Password To Hash
 * @returns {string} hashedPassword - Hashed Password 
 */
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (err) {
        throw err;
    }
}

/**
 * Validates Password
 * @param {string} plainTextPassword - Plain Text Password
 * @param {string} hashedPassword - Hashed Password
 * @returns {boolean} isValid - If Password Is Valid Or Not 
 */
const validatePassword = (plainTextPassword, hashedPassword) => {
    const isValid = bcrypt.compareSync(plainTextPassword, hashedPassword);
    return isValid;
}

// Exporting Auth Helper methods
module.exports = {
    getUserObject,
    hashPassword,
    validatePassword,
}