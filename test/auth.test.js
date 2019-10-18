const model = require('../models/users.model');
const sessionModel = require('../models/sessions.model');
const request = require('supertest');
const expect = require('chai').expect;
const app = require('../index');
const { users } = require('./mockData');

let sessionId, token;

describe('/auth', () => {
    beforeEach(async () => {
        try {
            await model.deleteMany({});
        } catch (err) {
            console.log('Error While deleteMany() In beforEach() Of Auth => ', err);
        }
    });

    describe('POST /login', () => {
        it('should login successfully', async () => {
            await model.create(users[0]);
            const res = await request(app).post(`/auth/login`).send({ user: users[0].userName, password: users[0].password });
            const { body: { data: { sessionId: currentSessionId, token: currentToken } = {} } = {} } = res;
            sessionId = currentSessionId;
            token = currentToken;
            const session = await sessionModel.findById(sessionId);

            const reLoginRes = await request(app).post(`/auth/login`).send({ user: users[0].userName, password: users[0].password });
            const { body: { data: { sessionId: reLoginSessionId } = {} } = {} } = reLoginRes;

            expect(res.status).to.equal(200);
            expect(res.body.data.user.userName).to.equal('userOne');
            expect(!!res.body.data.token).to.equal(true);
            expect(!!session).to.equal(true);
            expect(reLoginSessionId).to.equal(sessionId);
        });

        it('should return missing param: userName/Email', async () => {
            const res = await request(app).post(`/auth/login`).send({ password: users[0].password });
            expect(res.status).to.equal(422);
            expect(res.body.message).to.equal('Missing Required Param User Name/Email.');
        });

        it('should return missing param: Password', async () => {
            const res = await request(app).post(`/auth/login`).send({ user: users[0].userName });
            expect(res.status).to.equal(422);
            expect(res.body.message).to.equal('Missing Required Param Password.');
        });

        it('should return user not found', async () => {
            const res = await request(app).post(`/auth/login`).send({ user: users[0].userName, password: users[0].password });
            expect(res.status).to.equal(200);
            expect(res.body.statusCode).to.equal(204);
            expect(res.body.message).to.equal('User Not Found.');
        });

        it('should return invalid credentials', async () => {
            await model.create(users[0]);
            const res = await request(app).post(`/auth/login`).send({ user: users[0].userName, password: 'invalidPassword' });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid Credentials.');
        });
    });

    describe('GET /logout', () => {
        it('should logout the user', async () => {
            const res = await request(app).get('/auth/logout').set('Authorization', `Bearer ${token}`);
            const session = await sessionModel.findById(sessionId);
            expect(res.status).to.equal(200);
            expect(session).to.equal(null);
        });
    });
});