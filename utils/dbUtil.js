const mongoose = require('mongoose');
const { dbConfig } = require('../config');
const { crudService } = require('../services');
const { insertManyInDb } = crudService;

/**
 * Function To Initialize Mongoose Connection
 */
const initConnection = () => {
    return new Promise((resolve, reject) => {
        mongoose.Promise = global.Promise;

        // Connecting Mongo
        mongoose.connect(dbConfig.mongoURI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true });

        // When Successfully Connected
        mongoose.connection.on('connected', function () {
            console.log('Mongoose default connection open to ' + dbConfig.mongoURI);
            resolve();
        });

        // If The Connection Throws An Error
        mongoose.connection.on('error', function (err) {
            console.log('Mongoose default connection error: ' + err);
            reject(err);
        });

        // When The Connection Is Disconnected
        mongoose.connection.on('disconnected', function () {
            console.log('Mongoose default connection disconnected');
        });
    });
};

/**
 * Function To Close Mongoose Connection
 */
const closeConnection = () => {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
}

/**
 * Function To Load Products In DB
 */
const loadData = async () => {
    const payload = require('../constants/inventory.json');
    const isProductsExists = await checkIfCollectionExists('products');
    if (isProductsExists) await mongoose.connection.collections['products'].deleteMany({});
    await insertManyInDb(payload, 'products');
    console.log("Products Added Successfully.");
}

/**
 * Function To Check If Specific Collection Exists or Not
 * @param {string} collectionName - Collection Name To Check For Existance
 * @return {boolesn} - Flag If Collection Exists Or Not
 */
const checkIfCollectionExists = async (collectionName) => {
    let collectionList = await mongoose.connection.db.listCollections().toArray();
    collectionList = collectionList.map(({ name }) => name);
    return collectionList.includes(collectionName);
}

// Exporting Db Utility Methods
module.exports = {
    initConnection,
    closeConnection,
    loadData,
    checkIfCollectionExists,
}