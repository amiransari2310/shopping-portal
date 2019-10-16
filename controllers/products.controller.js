const { responseHandler: { sendSuccessResponse, sendErrorResponse, } = {} } = require('../utils');
const { crudService } = require('../services');
const { validationUtil: { validate } } = require('../utils');
const {
    listDataFromDb,
    createDataInDb,
    getDataFromDb,
    updateDataInDb,
    removeDataFromDb,
} = crudService;

/**
 * Handles Request To Return All Products Based On Params
 */
const listProducts = async (req, res) => {
    try {
        const { filter, sort, select, page, count } = req.query;
        let sortOn;
        if (sort) {
            const [key, val] = sort.trim()[0] === '-' ? [sort.trim().substr(1), -1] : [sort, 1];
            sortOn = {};
            sortOn[key] = val;
        }
        const skip = count && page ? count * page : 0;
        const query = filter ? JSON.parse(filter) : {};
        const selecteOrExclude = select ? select.replace(/\,/g, ' ') : '';
        const data = await listDataFromDb(query, sortOn, selecteOrExclude, skip, count, 'products');
        sendSuccessResponse(
            { req, res },
            'ok',
            data && data.length > 0 ? 200 : 204,
            data,
            data && data.length > 0 ? 'Products Records Fetched Successfully.' : 'No Records Found For Products.'
        );
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Fetching Products Records.');
    }
}

/**
 * Request To Create A Product
 */
const createProduct = async (req, res) => {
    try {
        const { error } = validate(req.body, 'products');
        const [isValid, errors] = [!error, error];
        if (isValid) {
            const data = await createDataInDb(req.body, 'products');
            sendSuccessResponse({ req, res }, 'ok', 201, data, 'Products Record Added Successfully.');
        } else {
            sendErrorResponse({ req, res }, 'badRequest', 400, errors, 'Invalid Product Payload.');
        }
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Creating Products Record.');
    }
}

/**
 * Handles Request To Return A Product Based On Input Id i.e Route Param
 */
const getProduct = async (req, res) => {
    try {
        const data = await getDataFromDb(req.params.id, '', 'products');
        sendSuccessResponse(
            { req, res },
            'ok',
            data ? 200 : 204,
            data,
            data ? 'Products Record Fetched Successfully.' : `No Record Found For Id: '${req.params.id}' In Products.`
        );
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Fetchig Products Record.');
    }
}

/**
 * Handles Request To Update A Product
 */
const updateProduct = async (req, res) => {
    try {
        const isExist = await getDataFromDb(req.params.id, '', 'products');
        let data = null;
        if (!isExist) {
            sendSuccessResponse(
                { req, res },
                'ok',
                204,
                {},
                `No Record Found For Id: '${req.params.id}' In Products.`
            );
        } else {
            const { error } = validate(req.body, 'products');
            const [isValid, errors] = [!error, error];
            if (isValid) {
                data = await updateDataInDb(req.params.id, req.body, 'products');
                data.password = undefined;
                sendSuccessResponse(
                    { req, res },
                    'ok',
                    200,
                    data,
                    `Products Record With Id: '${req.params.id}' Updated Successfully In Products.`
                );
            } else {
                sendErrorResponse({ req, res }, 'badRequest', 400, errors, 'Invalid Product Payload.');
            }
        }
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Updating Products Record.');
    }
}

/**
 * Handles Request To Remove A Products Based On Input Id i.e Route Param
 */
const removeProduct = async (req, res) => {
    try {
        const isExist = await getDataFromDb(req.params.id, '', 'products');
        let data = null;
        if (isExist) {
            data = await removeDataFromDb(req.params.id, 'products');
        }
        sendSuccessResponse(
            { req, res },
            'ok',
            isExist ? 200 : 204,
            isExist ? data : {},
            isExist ? `Products Record With Id: '${req.params.id}' Deleted Successfully In Products.` : `No Record Found For Id: '${req.params.id}' In Products.`
        );
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Deleting Products Record.');
    }
}

// Exporting Request Handlers
module.exports = {
    listProducts,
    createProduct,
    getProduct,
    updateProduct,
    removeProduct,
}