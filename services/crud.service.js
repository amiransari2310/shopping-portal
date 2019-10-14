const {
    users: usersModel,
    products: productsModel,
    sessions: sessionsModel,
    carts: cartsModel,
} = require('../models');

/**
 * Returns Specific Collection Model
 * @param {string} serviceName - String Service Name i.e same as Collection/Model Name
 * @return {object} model - Mongoose Collection Model Or Null
 */
const getModel = (serviceName) => {
    let model;
    switch (serviceName) {
        case 'users':
            model = usersModel;
            break;
        case 'products':
            model = productsModel;
            break;
        case 'sessions':
            model = sessionsModel;
            break;
        case 'carts':
            model = cartsModel;
            break;
        default:
            model = null;
    }
    return model;
}

/**
 * Returns Data From Collection Based On Input Params
 * @param {object} query - Valid Object To Query On Collection
 * @param {string} sortOn - To Define A Field To Be Sort On
 * @param {string} select - To Select Specific Field From DB
 * @param {number} skip - No Of Documents To Skip In DB 
 * @param {number} count - No Of Documents To Limit While Fetching From DB
 * @param {number} serviceName - String Service Name i.e same as Collection/Model Name
 * @return {promise} - Promise That Executes Mongo Query To Fetch Data From Db
 */
const listDataFromDb = (query, sortOn, select, skip, count, serviceName) => {
    const dbQuery = getModel(serviceName).find(query);
    if (sortOn) dbQuery.sort(sortOn);
    if (select) dbQuery.select(select);
    if (skip) dbQuery.skip(Number(skip));
    if (count) dbQuery.limit(Number(count));
    return dbQuery.lean();
}

/**
 * Returns First Matched Record From Collection Based On Input Params
 * @param {object} query - Valid Object To Query On Collection
 * @param {string} select - To Select Specific Field From DB
 * @param {number} serviceName - String Service Name i.e same as Collection/Model Name
 * @return {promise} - Promise That Executes Mongo Query To Fetch Data From Db
 */
const findOneFromDb = (query, select, serviceName) => {
    return getModel(serviceName).findOne(query).select(select);
}

/**
 * Returns First Matched Record From Collection Based On Input Params
 * @param {object} payload - Valid Object To Insert In DB
 * @param {number} serviceName - String Service Name i.e same as Collection/Model Name
 * @return {promise} - Promise That Executes Mongo Query To Create Record In Db
 */
const createDataInDb = (payload, serviceName) => {
    const model = getModel(serviceName);
    const doc = new model(payload);
    return doc.save();
}

/**
 * Returns Single Record From Collection Based On Input Id
 * @param {string} id - To Fetch Specofic Record From DB
 * @param {string} select - To Select Specific Field From DB
 * @param {number} serviceName - String Service Name i.e same as Collection/Model Name
 * @return {promise} - Promise That Executes Mongo Query To Fetch Data From Db
 */
const getDataFromDb = (id, select = '', serviceName) => {
    return getModel(serviceName).findById(id).select(select);
}

/**
 * Returns First Matched Record From Collection Based On Input Params
 * @param {string} id - To Update Specofic Record In DB 
 * @param {object} payload - Valid Object To Insert In DB
 * @param {number} serviceName - String Service Name i.e same as Collection/Model Name
 * @return {promise} - Promise That Executes Mongo Query To Update Record In Db
 */
const updateDataInDb = (id, payload, serviceName) => {
    return getModel(serviceName).findByIdAndUpdate(id, payload, { new: true });
}

/**
 * Removes Single Record From Collection Based On Input Id
 * @param {string} id - To Fetch Specofic Record From DB
 * @param {number} serviceName - String Service Name i.e same as Collection/Model Name
 * @return {promise} - Promise That Executes Mongo Query To Remove Data From Db
 */
const removeDataFromDb = (id, serviceName) => {
    return getModel(serviceName).findByIdAndRemove(id);
}

/**
 * Returns First Matched Record From Collection Based On Input Params
 * @param {object} payload - Valid Object To Insert Multiple Records In DB
 * @param {number} serviceName - String Service Name i.e same as Collection/Model Name
 * @return {promise} - Promise That Executes Mongo Query To Create Multiple Records In Db
 */
const insertManyInDb = (payload, serviceName) => {
    return getModel(serviceName).insertMany(payload);
}

// Exporting Database Query handlers
module.exports = {
    listDataFromDb,
    findOneFromDb,
    createDataInDb,
    getDataFromDb,
    updateDataInDb,
    removeDataFromDb,
    insertManyInDb,
}