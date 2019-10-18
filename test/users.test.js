const model = require('../models/users.model');
const request = require('supertest');
const expect = require('chai').expect;
const app = require('../index');
const { users } = require('./mockData');

describe('/users', () => {
    beforeEach(async () => {
        try {
            await model.deleteMany({});
        } catch (err) {
            console.log('Error While deleteMany() In beforEach() Of Users => ', err);
        }
    });

    describe('GET /', () => {
        it('should return all users', async () => {
            await model.insertMany(users);
            const res = await request(app).get('/users');
            expect(res.status).to.equal(200);
            expect(res.body.data.length).to.equal(2);
        });

        it('should return no users', async () => {
            const res = await request(app).get('/users');
            expect(res.status).to.equal(200);
            expect(res.body.data.length).to.equal(0);
            expect(res.body.statusCode).to.equal(204);
        });

        it('should return error with 500', async () => {
            const res = await request(app).get('/users?filter="invalidJson"');
            expect(res.status).to.equal(500);
            expect(res.body.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Error While Fetching Users Records.');
        });

        it('should return success when using query params', async () => {
            await model.insertMany(users);
            const res = await request(app).get('/users?filter={"lastName":"One"}&page=0&count=1&sort=lastName');
            expect(res.status).to.equal(200);
            expect(res.body.statusCode).to.equal(200);
            expect(res.body.data.length).to.equal(1);
        });
    });

    describe('GET /:id', () => {
        it('should return single object', async () => {
            const doc = await model.create(users[0]);
            const res = await request(app).get(`/users/${doc._id}`);
            expect(res.status).to.equal(200);
            expect(res.body.data._id).to.equal(doc._id.toString());
        });

        it('should return no user record found', async () => {
            const doc = await model.create(users[0]);
            const { _id } = doc;
            await doc.remove({ _id });
            const res = await request(app).get(`/users/${_id}`);
            expect(res.status).to.equal(200);
            expect(res.body.data).to.equal(null);
            expect(res.body.statusCode).to.equal(204);
        });

        it('should return server error 500', async () => {
            const res = await request(app).get(`/users/invalidId`);
            expect(res.status).to.equal(500);
            expect(res.body.message).to.equal('Error While Fetchig Users Record.');
        });
    });

    describe('POST /', () => {
        it('should create a record in db', async () => {
            const res = await request(app).post(`/users`).send(users[0]);
            expect(res.status).to.equal(200);
        });

        it('should return validation error', async () => {
            const { firstName, ...user } = users[0];
            const res = await request(app).post(`/users`).send(user);
            expect(res.status).to.equal(400);
        });

        it('should return server error 500 when duplicate values for unique fields are passed', async () => {
            await model.create(users[0]);
            const res = await request(app).post(`/users`).send(users[0]);
            expect(res.status).to.equal(500);
        });
    });

    describe('PUT /', () => {
        it('should update a record in db', async () => {
            const doc = await model.create(users[0]);
            let recordToUpdate = users[0];
            recordToUpdate.userName = 'newUserName';
            const res = await request(app).put(`/users/${doc._id}`).send(recordToUpdate);
            expect(res.status).to.equal(200);
            expect(res.body.data.userName).to.equal('newUserName');
        });

        it('should return user record not found', async () => {
            const doc = await model.create(users[0]);
            const { _id } = doc;
            await doc.remove({ _id });
            const res = await request(app).put(`/users/${_id}`).send(users[0]);
            expect(res.status).to.equal(200);
            expect(res.body.statusCode).to.equal(204);
        });

        it('should return validation error', async () => {
            const doc = await model.create(users[0]);
            const { _id } = doc;
            const { firstName, ...user } = users[0];
            const res = await request(app).put(`/users/${_id}`).send(user);
            expect(res.status).to.equal(400);
        });

        it('should return server error 500', async () => {
            const res = await request(app).put(`/users/invalidId`).send(users[0]);
            expect(res.status).to.equal(500);
            expect(res.body.message).to.equal('Error While Updating User Record.');
        });
    });

    describe('DELETE /:id', () => {
        it('should remove single object', async () => {
            const doc = await model.create(users[0]);
            const res = await request(app).delete(`/users/${doc._id}`);
            expect(res.status).to.equal(200);
            expect(res.body.data._id).to.equal(doc._id.toString());
        });

        it('should return no user record found', async () => {
            const doc = await model.create(users[0]);
            const { _id } = doc;
            await doc.remove({ _id });
            const res = await request(app).delete(`/users/${_id}`);
            expect(res.status).to.equal(200);
            expect(res.body.statusCode).to.equal(204);
        });

        it('should return server error 500', async () => {
            const res = await request(app).delete(`/users/invalidId`);
            expect(res.status).to.equal(500);
            expect(res.body.message).to.equal('Error While Deleting Users Record.');
        });
    });
});