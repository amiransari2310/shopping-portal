const model = require('../models/products.model');
const userModel = require('../models/users.model');
const request = require('supertest');
const expect = require('chai').expect;
const app = require('../index');
const { users } = require('./mockData');
let products = require('../constants/inventory.json'), token;
products = products.slice(0, 2);

describe('/products', () => {
    beforeEach(async () => {
        try {
            await model.deleteMany({});
            await userModel.deleteMany({});
            if (!token) {
                await userModel.create(users[0]);
                const loginResponse = await request(app).post('/auth/login').send({ user: users[0].userName, password: users[0].password });
                const { body: { data: { token: newToken } = {} } = {} } = loginResponse;
                token = newToken;
            }
        } catch (err) {
            console.log('Error While deleteMany() In beforEach() Of Prodcuts => ', err);
        }
    });

    describe('GET /', () => {
        it('should return all products', async () => {
            await model.deleteMany({});
            await model.insertMany(products);
            const res = await request(app).get('/products').set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data.length).to.equal(2);
        });

        it('should return no products', async () => {
            const res = await request(app).get('/products').set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data.length).to.equal(0);
            expect(res.body.statusCode).to.equal(204);
        });

        it('should return error with 500', async () => {
            const res = await request(app).get('/products?filter="invalidJson"').set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(500);
            expect(res.body.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Error While Fetching Products Records.');
        });

        it('should return success when using query params', async () => {
            await model.insertMany(products);
            const res = await request(app).get('/products?filter={"productId":"product1"}&page=0&count=1&sort=productId').set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.statusCode).to.equal(200);
            expect(res.body.data.length).to.equal(1);
        });
    });

    describe('GET /:id', () => {
        it('should return single object', async () => {
            const doc = await model.create(products[0]);
            const res = await request(app).get(`/products/${doc._id}`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data._id).to.equal(doc._id.toString());
        });

        it('should return no product record found', async () => {
            const doc = await model.create(products[0]);
            const { _id } = doc;
            await doc.remove({ _id });
            const res = await request(app).get(`/products/${_id}`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data).to.equal(null);
            expect(res.body.statusCode).to.equal(204);
        });

        it('should return server error 500', async () => {
            const res = await request(app).get(`/products/invalidId`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(500);
            expect(res.body.message).to.equal('Error While Fetchig Products Record.');
        });
    });

    describe('POST /', () => {
        it('should create a record in db', async () => {
            const res = await request(app).post(`/products`).send(products[0]).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
        });

        it('should return validation error', async () => {
            const { productId, ...product } = products[0];
            const res = await request(app).post(`/products`).send(product).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(400);
        });

        it('should return server error 500 when duplicate values for unique fields are passed', async () => {
            await model.create(products[0]);
            const res = await request(app).post(`/products`).send(products[0]).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(500);
        });
    });

    describe('PUT /', () => {
        it('should update a record in db', async () => {
            const doc = await model.create(products[0]);
            let recordToUpdate = products[0];
            recordToUpdate.costPrice = 100;
            const res = await request(app).put(`/products/${doc._id}`).send(recordToUpdate).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data.costPrice).to.equal(100);
        });

        it('should return product record not found', async () => {
            const doc = await model.create(products[0]);
            const { _id } = doc;
            await doc.remove({ _id });
            const res = await request(app).put(`/products/${_id}`).send(products[0]).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.statusCode).to.equal(204);
        });

        it('should return validation error', async () => {
            const { productId, ...product } = products[0];
            const doc = await model.create(products[0]);
            const { _id } = doc;
            const res = await request(app).put(`/products/${_id}`).send(product).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(400);
        });

        it('should return server error 500', async () => {
            const res = await request(app).put(`/products/invalidId`).send(products[0]).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(500);
            expect(res.body.message).to.equal('Error While Updating Products Record.');
        });
    });

    describe('DELETE /:id', () => {
        it('should remove single object', async () => {
            const doc = await model.create(products[0]);
            const res = await request(app).delete(`/products/${doc._id}`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data._id).to.equal(doc._id.toString());
        });

        it('should return no product record found', async () => {
            const doc = await model.create(products[0]);
            const { _id } = doc;
            await doc.remove({ _id });
            const res = await request(app).delete(`/products/${_id}`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.statusCode).to.equal(204);
        });

        it('should return server error 500', async () => {
            const res = await request(app).delete(`/products/invalidId`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(500);
            expect(res.body.message).to.equal('Error While Deleting Products Record.');
        });
    });
});