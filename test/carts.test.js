const model = require("../models/carts.model");
const userModel = require("../models/users.model");
const request = require("supertest");
const expect = require("chai").expect;
const app = require("../index");
const { users, cartProducts } = require('./mockData');
let user, token;

describe("/carts", () => {
    describe("POST /", () => {

        it("should return validation err", async () => {
            await doLogIn();
            const { products: [product] } = cartProducts;
            const { productId, ...cart } = product;
            const res = await request(app).post("/carts/add").send([cart]).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(400);
        });

        it("should return missing token err", async () => {
            const res = await request(app).post("/carts/add").send(cartProducts);
            expect(res.status).to.equal(400);
        });

        it("should return invalid/unauthorize token err", async () => {
            const res = await request(app).post("/carts/add").send(cartProducts).set('Authorization', `Bearer Invalid Token`);
            expect(res.status).to.equal(401);
        });

        it("should create users cart", async () => {
            await doLogIn();
            const res = await request(app).post("/carts/add").send(cartProducts).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data.user).to.equal(user._id.toString());
        });

        it("should add products in cart", async () => {
            const res = await request(app).post("/carts/add").send(cartProducts).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data.user).to.equal(user._id.toString());
        });

        it("should remove products from cart", async () => {
            const res = await request(app).post("/carts/remove").send(cartProducts).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data.user).to.equal(user._id.toString());
        });

        it("should return missing param error", async () => {
            const res = await request(app).post("/carts/invalid").send(cartProducts).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(400);
            expect(res.body.statusCode).to.equal(400);
        });

        it("should return logged in users cart not found while adding/removing products", async () => {
            await model.deleteOne({ user: user._id.toString() });
            const res = await request(app).post("/carts/remove").set('Authorization', `Bearer ${token}`);
            expect(res.body.statusCode).to.equal(204);
            expect(res.body.message).to.equal(`Cart Not Found For User: '${user._id.toString()}' In Carts.`);
        });
    });

    describe("GET /", () => {
        it("should return logged in users cart", async () => {
            await doLogIn();
            await request(app).post("/carts/add").send(cartProducts).set('Authorization', `Bearer ${token}`);
            const res = await request(app).get("/carts").set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data.user).to.equal(user._id.toString());
            await model.deleteOne({ user: user._id.toString() });
        });

        it("should return logged in users cart not found", async () => {
            const res = await request(app).get("/carts").set('Authorization', `Bearer ${token}`);
            expect(res.body.statusCode).to.equal(204);
            expect(res.body.message).to.equal(`No Record Found For User: '${user._id.toString()}' In Carts.`);
        });
    });
});

const doLogIn = async () => {
    await userModel.deleteMany({});
    const newUser = await userModel.create(users[0]);
    const loginResponse = await request(app).post("/auth/login").send({ user: users[0].userName, password: users[0].password });
    const { body: { data: { token: newToken } = {} } = {} } = loginResponse;
    user = newUser;
    token = newToken;
}