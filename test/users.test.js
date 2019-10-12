const model = require("../models/users.model");
const request = require("supertest");
const expect = require("chai").expect;
const app = require("../index");
const { users } = require('./mockData');

describe("/users", () => {
    beforeEach(async () => {
        try {
            await model.deleteMany({});
        } catch (err) {
            console.log("Error While deleteMany() In beforEach() Of Users => ", err);
        }
    });

    describe("GET /", () => {
        it("should return all users", async () => {
            try {
                await model.insertMany(users);
                const res = await request(app).get("/users");
                expect(res.status).to.equal(200);
                expect(res.body.data.length).to.equal(2);
            } catch (err) {
                console.log("Error In Return All Users Test => ", err);
            }
        });

        it("should return no users", async () => {
            try {
                const res = await request(app).get("/users");
                expect(res.status).to.equal(200);
                expect(res.body.data.length).to.equal(0);
                expect(res.body.statusCode).to.equal(204);
            } catch (err) {
                console.log("Error In No Users Test => ", err);
            }
        });

        it("should return error with 500", async () => {
            try {
                const res = await request(app).get("/users?filter='invalidJson'");
                expect(res.status).to.equal(500);
                expect(res.body.statusCode).to.equal(500);
                expect(res.body.message).to.equal('Error While Fetchig Users Records.');
            } catch (err) {
                console.log("Error In Users Server Error Test => ", err);
            }
        });

        it("should return success when using query params", async () => {
            try {
                await model.insertMany(users);
                const res = await request(app).get('/users?filter={"lastName": "One"}&page=1&count=1&sort=lastName');
                expect(res.status).to.equal(200);
                expect(res.body.statusCode).to.equal(200);
                expect(res.body.data.length).to.equal(1);
            } catch (err) {
                console.log("Error In Users Return All With Query Params Test => ", err);
            }
        });
    });

    describe("GET /:id", () => {
        it("should return single object", async () => {
            try {
                const doc = await model.create(users[0]);
                const res = await request(app).get(`/users/${doc._id}`);
                expect(res.status).to.equal(200);
                expect(res.body.data._id).to.equal(doc._id.toString());
            } catch (err) {
                console.log("Error In Get User By Id Test => ", err);
            }
        });

        it("should return no user record found", async () => {
            try {
                const doc = await model.create(users[0]);
                const { _id } = doc;
                await doc.remove({ _id });
                const res = await request(app).get(`/users/${_id}`);
                expect(res.status).to.equal(200);
                expect(res.body.data).to.equal(null);
                expect(res.body.statusCode).to.equal(204);
            } catch (err) {
                console.log("Error In Get User By Id, Record Not Found Test => ", err);
            }
        });

        it("should return server error 500", async () => {
            try {
                const res = await request(app).get(`/users/invalidId`);
                expect(res.status).to.equal(500);
                expect(res.body.message).to.equal('Error While Fetchig Users Record.');
            } catch (err) {
                console.log("Error In Get User By Id, Server Error Test => ", err);
            }
        });
    });

    describe("POST /", () => {
        it("should create a record in db", async () => {
            try {
                const res = await request(app).post(`/users`).send(users[0]);
                expect(res.status).to.equal(200);
            } catch (err) {
                console.log("Error In Create User Test => ", err);
            }
        });

        it("should return server error 500 when duplicate values for unique fields are passed", async () => {
            try {
                await model.create(users[0]);
                const res = await request(app).post(`/users`).send(users[0]);
                expect(res.status).to.equal(500);
            } catch (err) {
                console.log("Error In Create User Server Error Test => ", err);
            }
        });
    });

    describe("POST /login", () => {
        it("should login successfully", async () => {
            try {
                await model.create(users[0]);
                const res = await request(app).post(`/users/login`).send({ user: users[0].userName, password: users[0].password });
                expect(res.status).to.equal(200);
                expect(res.body.data.user.userName).to.equal('userOne');
                expect(!!res.body.data.token).to.equal(true);
            } catch (err) {
                console.log("Error In Login Test => ", err);
            }
        });

        it("should return missing param: userName/Email", async () => {
            try {
                const res = await request(app).post(`/users/login`).send({ password: users[0].password });
                expect(res.status).to.equal(422);
                expect(res.body.message).to.equal('Missing Required Param User Name/Email.');
            } catch (err) {
                console.log("Error In Missing Param While Login Test => ", err);
            }
        });

        it("should return missing param: Password", async () => {
            try {
                const res = await request(app).post(`/users/login`).send({ user: users[0].userName });
                expect(res.status).to.equal(422);
                expect(res.body.message).to.equal('Missing Required Param Password.');
            } catch (err) {
                console.log("Error In Missing Param While Login Test => ", err);
            }
        });

        it("should return user not found", async () => {
            try {
                const res = await request(app).post(`/users/login`).send({ user: users[0].userName, password: users[0].password });
                expect(res.status).to.equal(200);
                expect(res.body.statusCode).to.equal(204);
                expect(res.body.message).to.equal('User Not Found.');
            } catch (err) {
                console.log("Error In User Not Found While Login Test => ", err);
            }
        });

        it("should return invalid credentials", async () => {
            try {
                await model.create(users[0]);
                const res = await request(app).post(`/users/login`).send({ user: users[0].userName, password: 'invalidPassword' });
                expect(res.status).to.equal(400);
                expect(res.body.message).to.equal('Invalid Credentials.');
            } catch (err) {
                console.log("Error In Invalid Credentials While Login Test => ", err);
            }
        });
    });

    describe("PUT /", () => {
        it("should update a record in db", async () => {
            try {
                const doc = await model.create(users[0]);
                let recordToUpdate = users[0];
                recordToUpdate.userName = 'newUserName';
                const res = await request(app).put(`/users/${doc._id}`).send(recordToUpdate);
                expect(res.status).to.equal(200);
                expect(res.body.data.userName).to.equal('newUserName');
            } catch (err) {
                console.log("Error In Update User Test => ", err);
            }
        });

        it("should return user record not found", async () => {
            try {
                const doc = await model.create(users[0]);
                const { _id } = doc;
                await doc.remove({ _id });
                const res = await request(app).put(`/users/${_id}`).send(users[0]);
                expect(res.status).to.equal(200);
                expect(res.body.statusCode).to.equal(204);
            } catch (err) {
                console.log("Error In Update User, Record Not Found Test => ", err);
            }
        });

        it("should return server error 500", async () => {
            try {
                const res = await request(app).put(`/users/invalidId`).send(users[0]);
                expect(res.status).to.equal(500);
                expect(res.body.message).to.equal('Error While Updating user Record.');
            } catch (err) {
                console.log("Error In Update User, Server Error Test => ", err);
            }
        });
    });

    describe("DELETE /:id", () => {
        it("should remove single object", async () => {
            try {
                const doc = await model.create(users[0]);
                const res = await request(app).delete(`/users/${doc._id}`);
                expect(res.status).to.equal(200);
                expect(res.body.data._id).to.equal(doc._id.toString());
            } catch (err) {
                console.log("Error In Remove User Test => ", err);
            }
        });

        it("should return no user record found", async () => {
            try {
                const doc = await model.create(users[0]);
                const { _id } = doc;
                await doc.remove({ _id });
                const res = await request(app).delete(`/users/${_id}`);
                expect(res.status).to.equal(200);
                expect(res.body.statusCode).to.equal(204);
            } catch (err) {
                console.log("Error In Remove User, No Record Found Test => ", err);
            }
        });

        it("should return server error 500", async () => {
            try {
                const res = await request(app).delete(`/users/invalidId`);
                expect(res.status).to.equal(500);
                expect(res.body.message).to.equal('Error While Deleting Users Record.');
            } catch (err) {
                console.log("Error In Remove User, Server Error Test => ", err);
            }
        });
    });
});