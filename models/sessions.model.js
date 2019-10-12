const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionsSchema = new Schema({
    user: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('sessions', sessionsSchema, 'sessions');
