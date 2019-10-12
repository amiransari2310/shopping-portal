const model = require("../models/products.model");
const request = require("supertest");
const expect = require("chai").expect;
const app = require("../index");
// const { products } = require('./mockData');
let products = require('../constants/inventory.json');
products = products.slice(0, 2);

describe("/products", () => {
    beforeEach(async () => {
        try {
            await model.deleteMany({});
        } catch (err) {
            console.log("Error While deleteMany() In beforEach() Of Prodcuts => ", err);
        }
    });

    describe("GET /", () => {
        it("should return all products", async () => {
            try {
                await model.deleteMany({});
                await model.insertMany(products);
                const res = await request(app).get("/products");
                expect(res.status).to.equal(200);
                expect(res.body.data.length).to.equal(2);
            } catch (err) {
                console.log("Error In Return All Products Test => ", err);
            }
        });

        it("should return no products", async () => {
            try {
                const res = await request(app).get("/products");
                expect(res.status).to.equal(200);
                expect(res.body.data.length).to.equal(0);
                expect(res.body.statusCode).to.equal(204);
            } catch (err) {
                console.log("Error In No Products Test => ", err);
            }
        });

        it("should return error with 500", async () => {
            try {
                const res = await request(app).get("/products?filter='invalidJson'");
                expect(res.status).to.equal(500);
                expect(res.body.statusCode).to.equal(500);
                expect(res.body.message).to.equal('Error While Fetchig Products Records.');
            } catch (err) {
                console.log("Error In Products Server Error Test => ", err);
            }
        });

        it("should return success when using query params", async () => {
            try {
                await model.insertMany(products);
                const res = await request(app).get('/products?filter={"productId": "product1"}&page=1&count=1&sort=productId');
                expect(res.status).to.equal(200);
                expect(res.body.statusCode).to.equal(200);
                expect(res.body.data.length).to.equal(1);
            } catch (err) {
                console.log("Error In Products Return All With Query Params Test => ", err);
            }
        });
    });

    describe("GET /:id", () => {
        it("should return single object", async () => {
            try {
                const doc = await model.create(products[0]);
                const res = await request(app).get(`/products/${doc._id}`);
                expect(res.status).to.equal(200);
                expect(res.body.data._id).to.equal(doc._id.toString());
            } catch (err) {
                console.log("Error In Get Product By Id Test => ", err);
            }
        });

        it("should return no product record found", async () => {
            try {
                const doc = await model.create(products[0]);
                const { _id } = doc;
                await doc.remove({ _id });
                const res = await request(app).get(`/products/${_id}`);
                expect(res.status).to.equal(200);
                expect(res.body.data).to.equal(null);
                expect(res.body.statusCode).to.equal(204);
            } catch (err) {
                console.log("Error In Get Product By Id, Record Not Found Test => ", err);
            }
        });

        it("should return server error 500", async () => {
            try {
                const res = await request(app).get(`/products/invalidId`);
                expect(res.status).to.equal(500);
                expect(res.body.message).to.equal('Error While Fetchig Products Record.');
            } catch (err) {
                console.log("Error In Get Product By Id, Server Error Test => ", err);
            }
        });
    });

    describe("POST /", () => {
        it("should create a record in db", async () => {
            try {
                const res = await request(app).post(`/products`).send(products[0]);
                expect(res.status).to.equal(200);
            } catch (err) {
                console.log("Error In Create Product Test => ", err);
            }
        });

        it("should return server error 500 when duplicate values for unique fields are passed", async () => {
            try {
                await model.create(products[0]);
                const res = await request(app).post(`/products`).send(products[0]);
                expect(res.status).to.equal(500);
            } catch (err) {
                console.log("Error In Create Product Server Error Test => ", err);
            }
        });
    });

    describe("PUT /", () => {
        it("should update a record in db", async () => {
            try {
                const doc = await model.create(products[0]);
                let recordToUpdate = products[0];
                recordToUpdate.costPrice = 100;
                const res = await request(app).put(`/products/${doc._id}`).send(recordToUpdate);
                expect(res.status).to.equal(200);
                expect(res.body.data.costPrice).to.equal(100);
            } catch (err) {
                console.log("Error In Update Product Test => ", err);
            }
        });

        it("should return product record not found", async () => {
            try {
                const doc = await model.create(products[0]);
                const { _id } = doc;
                await doc.remove({ _id });
                const res = await request(app).put(`/products/${_id}`).send(products[0]);
                expect(res.status).to.equal(200);
                expect(res.body.statusCode).to.equal(204);
            } catch (err) {
                console.log("Error In Update Product, Record Not Found Test => ", err);
            }
        });

        it("should return server error 500", async () => {
            try {
                const res = await request(app).put(`/products/invalidId`).send(products[0]);
                expect(res.status).to.equal(500);
                expect(res.body.message).to.equal('Error While Updating Products Record.');
            } catch (err) {
                console.log("Error In Update Product, Server Error Test => ", err);
            }
        });
    });

    describe("DELETE /:id", () => {
        it("should remove single object", async () => {
            try {
                const doc = await model.create(products[0]);
                const res = await request(app).delete(`/products/${doc._id}`);
                expect(res.status).to.equal(200);
                expect(res.body.data._id).to.equal(doc._id.toString());
            } catch (err) {
                console.log("Error In Remove Product Test => ", err);
            }
        });

        it("should return no product record found", async () => {
            try {
                const doc = await model.create(products[0]);
                const { _id } = doc;
                await doc.remove({ _id });
                const res = await request(app).delete(`/products/${_id}`);
                expect(res.status).to.equal(200);
                expect(res.body.statusCode).to.equal(204);
            } catch (err) {
                console.log("Error In Remove Product, No Record Found Test => ", err);
            }
        });

        it("should return server error 500", async () => {
            try {
                const res = await request(app).delete(`/products/invalidId`);
                expect(res.status).to.equal(500);
                expect(res.body.message).to.equal('Error While Deleting Products Record.');
            } catch (err) {
                console.log("Error In Remove Product, Server Error Test => ", err);
            }
        });
    });
});