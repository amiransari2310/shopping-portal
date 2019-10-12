const { responseHandler: { sendSuccessResponse, sendErrorResponse, } = {} } = require('../utils');
const { crudService } = require('../services');
const {
    listDataFromDb,
    createDataInDb,
    getDataFromDb,
    updateDataInDb,
    removeDataFromDb,
} = crudService;

/**
 * Handles Request To Return All User Based On Params
 */
const listUsers = async (req, res) => {
    try {
        const { filter, sort, page, count } = req.query;
        let sortOn;
        if (sort) {
            const [key, val] = sort[0] === '-' ? [sort.substr(1), -1] : [sort, 1];
            sortOn = {};
            sortOn[key] = val;
        }
        const skip = count && page ? count * page : 0;
        const query = filter ? JSON.parse(filter) : {};
        const data = await listDataFromDb(query, sortOn, '-password', skip, count, 'users');
        sendSuccessResponse(
            { req, res },
            'ok',
            data && data.length > 0 ? 200 : 204,
            data,
            data && data.length > 0 ? 'Users Records Fetched Successfully.' : 'No Records Found For Users.'
        );
    } catch (err) {
        console.log(err)
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Fetching Users Records.');
    }
}

/**
 * Request To Create A User
 */
const createUser = async (req, res) => {
    try {
        const data = await createDataInDb(req.body, 'users');
        const { _id } = data;
        sendSuccessResponse({ req, res }, 'ok', 201, { _id }, 'Users Record Created Successfully.');
    } catch (err) {
        console.log(err)
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Creating Users Record.');
    }
}

/**
 * Handles Request To Return A User Based On Input Id i.e Route Param
 */
const getUser = async (req, res) => {
    try {
        const data = await getDataFromDb(req.params.id, '-password', 'users');
        sendSuccessResponse(
            { req, res },
            'ok',
            data ? 200 : 204,
            data,
            data ? 'Users Record Fetched Successfully.' : `No Record Found For Id: '${req.params.id}' In Users.`
        );
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Fetchig Users Record.');
    }
}

/**
 * Handles Request To Update A User
 */
const updateUser = async (req, res) => {
    try {
        const isExist = await getDataFromDb(req.params.id, '', 'users');
        let data = null;
        if (isExist) {
            data = await updateDataInDb(req.params.id, req.body, 'users');
            data.password = undefined;
        }
        sendSuccessResponse(
            { req, res },
            'ok',
            isExist ? 200 : 204,
            isExist ? data : {},
            isExist ? `Users Record With Id: '${req.params.id}' Updated Successfully In Users.` : `No Record Found For Id: '${req.params.id}' In Users.`
        );
    } catch (err) {
        console.log(err)
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Updating User Record.');
    }
}

/**
 * Handles Request To Remove A User Based On Input Id i.e Route Param
 */
const removeUser = async (req, res) => {
    try {
        const isExist = await getDataFromDb(req.params.id, '', 'users');
        let data = null;
        if (isExist) {
            data = await removeDataFromDb(req.params.id, 'users');
            data.password = undefined;
        }
        sendSuccessResponse(
            { req, res },
            'ok',
            isExist ? 200 : 204,
            isExist ? data : {},
            isExist ? `Users Record With Id: '${req.params.id}' Deleted Successfully In Users.` : `No Record Found For Id: '${req.params.id}' In Users.`
        );
    } catch (err) {
        console.log(err)
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Deleting Users Record.');
    }
}

// Exporting Request Handlers
module.exports = {
    listUsers,
    createUser,
    getUser,
    updateUser,
    removeUser,
}