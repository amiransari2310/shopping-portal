const mongoose = require('mongoose');
const expect = require("chai").expect;
const app = require("../index");

after(function (done) {
    return mongoose.disconnect(done);
});

describe("mongoose error connection event", () => {
    it('should call mongoose error event', async () => {
        try {
            return await mongoose.connect('invalidConnectionString');
        } catch (err) {
            expect(err.message).to.equal('Invalid schema, expected `mongodb` or `mongodb+srv`');
        }
    });
});

describe("mongoose close connection event", () => {
    it('should call closeConnection() on process exit', () => {
        process.emit('SIGINT');
    });
});