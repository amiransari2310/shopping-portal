const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { authHelper: { hashPassword, validatePassword } } = require('../helpers');

const usersSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
    },
    mobileNumber: {
        type: Number,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'customer',
        enum: [
            'customer',
            'admin',
        ]
    }
});

/**
 * Pre Save Hook to Encrypt Password Before Storing It In DB
 */
usersSchema.pre('save', async function (next) {
    try {
        const { password: plainTextPassword } = this;
        this.password = await hashPassword(plainTextPassword); // Hashing And Overwriting Plain Text Password
        next();
    } catch (err) {
        next(err);
    }
});

/**
 * Method To Compare Password
 * @param {string} plainTextPassword - Plain Text Password String To Compare
 * @param {function} next - Callback Function To Return Control To The Callee
 * @return {error|boolean} err|isMatch - Returns Error Or Boolean Flag For Password Match
 */
usersSchema.methods.comparePassword = function (plainTextPassword, next) {
    try {
        const { password: hashedPassword } = this;
        const isMatch = validatePassword(plainTextPassword, hashedPassword);
        return next(null, isMatch);
    } catch (err) {
        return next(err);
    }
};

module.exports = mongoose.model('users', usersSchema, 'users');
