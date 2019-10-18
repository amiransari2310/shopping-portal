const {
    responseHandler: { sendSuccessResponse, sendErrorResponse } = {},
    validationUtil: { validate } = {},
    logUtil: { log } = {},
} = require('../utils');
const { authHelper } = require('../helpers');
const { crudService } = require('../services');
const {
    createDataInDb,
    updateDataInDb,
    findOneFromDb,
} = crudService;

/**
 * Handles Request To Return A Cart Based On User In Request
 */
const getCart = async (req, res) => {
    try {
        const userObject = authHelper.getUserObject(req);
        const { _id: user } = userObject;
        log('info', {
            message: `Get Cart For User: '${user}'`,
            timeStamp: new Date().toString()
        });
        const data = await findOneFromDb({ user }, '', 'carts');
        sendSuccessResponse(
            { req, res },
            'ok',
            data ? 200 : 204,
            data,
            data ? 'Carts Record Fetched Successfully.' : `No Record Found For User: '${user}' In Carts.`
        );
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Fetchig Users Carts Record.');
    }
}

/**
 * Handles Request To Update A Cart
 */
const createOrupdateCart = async (req, res) => {
    try {
        const userObject = authHelper.getUserObject(req);
        const { params: { op } = {}, body: payload } = req;
        const { error } = validate(payload, 'carts');
        const [isValid, errors] = [!error, error];
        if (isValid) {
            const { _id: user } = userObject;
            const opEnums = ['add', 'remove'];
            let data = null;
            if (!opEnums.includes(op)) {
                sendErrorResponse({ req, res }, 'badRequest', 400, {}, `Missing/Invalid Value For Query Param: 'op'. Possible values are: [${opEnums}]`);
            } else {
                const cart = await findOneFromDb({ user }, '', 'carts');    // Checking If Cart Already Exists
                const cartObj = cart ? cart.toObject() : {};

                if (!cart) {
                    if (op === 'add') {
                        log('info', {
                            message: `Creating Cart For User: '${user}'`,
                            timeStamp: new Date().toString()
                        });
                        const { products: newProductList = [] } = payload;
                        const { products, totalCost } = addProducts([], newProductList, 0);
                        const createPayload = { user, products, totalCost };
                        data = await createDataInDb(createPayload, 'carts');    // Creating NEw Cart
                        sendSuccessResponse(
                            { req, res },
                            'ok',
                            200,
                            data,
                            `Cart Created Successfully For User: '${user}' In Carts.`
                        );
                    } else {
                        sendSuccessResponse(
                            { req, res },
                            'ok',
                            204,
                            {},
                            `Cart Not Found For User: '${user}' In Carts.`
                        );
                    }
                } else {
                    log('info', {
                        message: `Updating Cart For User: '${user}'`,
                        timeStamp: new Date().toString()
                    });
                    const updatePayload = getCartData(cart, payload, op);
                    data = await updateDataInDb(cartObj._id, updatePayload, 'carts');       // Updating Cart If Already Exists
                    sendSuccessResponse(
                        { req, res },
                        'ok',
                        200,
                        data,
                        `Carts For User: '${user}' Updated Successfully In Carts.`
                    );
                }
            }
        } else {
            sendErrorResponse({ req, res }, 'badRequest', 400, errors, 'Invalid Cart Payload.');
        }
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Updating Cart Record.');
    }
}

/**
 * Compute The Object To Be Stored/Update In Cart Collection
 * @param {object} existingCartData - Old Cart Object If Available Or {}
 * @param {object} newCartData - New Cart Object To Compute
 * @param {string} op - Valid Enum String for op i.e Type Of Operation
 * @return {object} Cart Object To Be Stored/Update
 */
const getCartData = (existingCartData, newCartData, op) => {
    const { products: oldProductList = [], totalCost: oldTotalCost = 0, user } = existingCartData;
    const { products: newProductList = [] } = newCartData;
    if (!op || !newProductList.length) return existingCartData;
    else {
        const { products, totalCost } = (op === 'add') ? addProducts(oldProductList, newProductList, oldTotalCost) : removeProducts(oldProductList, newProductList, oldTotalCost);
        return { user, products, totalCost };
    }
}

/**
 * Combine Old and New Products List & Calculates Cost
 * @param {[object]} oldProductList - Old Product List From Old Cart Object
 * @param {[object]} newProductList - New Product List From New Cart Object
 * @param {number} finalTotalCost - Existing Total Cost In Cart Object Or 0
 * @return {object} An Object With Final Combined Product List & Final Cost Calculated
 */
const addProducts = (oldProductList, newProductList, finalTotalCost) => {
    let updatedProductsList = [];
    newProductList.forEach(product => {
        const { productId, quantity = 1, costPerUnit = 0 } = product;
        const existingProduct = oldProductList.find(({ productId: oldProductId }) => oldProductId === productId);
        const newProductsCost = quantity * costPerUnit;
        if (existingProduct) {
            const { quantity: existingQuantity, cost: existingCost = 0 } = existingProduct;
            const newQuantity = existingQuantity + quantity;
            const newCost = newProductsCost + existingCost;
            updatedProductsList = [...updatedProductsList, { productId, quantity: newQuantity, costPerUnit, cost: newCost }];
            finalTotalCost = finalTotalCost + newProductsCost;
        } else {
            updatedProductsList = [...updatedProductsList, { productId, quantity, costPerUnit, cost: newProductsCost }];
            finalTotalCost = finalTotalCost + newProductsCost;
        }
    });
    return { products: updatedProductsList, totalCost: finalTotalCost };
}

/**
 * Removes Products From Old Product List & Calculates Cost
 * @param {[object]} oldProductList - Old Product List From Old Cart Object
 * @param {[object]} newProductList - New Product List From New Cart Object
 * @param {number} finalTotalCost - Existing Total Cost In Cart Object Or 0
 * @return {object} An Object With Final Product List & Final Cost Calculated
 */
const removeProducts = (oldProductList, newProductList, finalTotalCost) => {
    let updatedProductsList = [];
    newProductList.forEach(product => {
        const { productId, quantity = 1, costPerUnit = 0 } = product;
        const existingProduct = oldProductList.find(({ productId: oldProductId }) => oldProductId === productId);
        const newProductsCost = quantity * costPerUnit;
        if (existingProduct) {
            const { quantity: existingQuantity, cost: existingCost = 0 } = existingProduct;
            const newQuantity = (existingQuantity - quantity) < 0 ? 0 : (existingQuantity - quantity);
            const newCost = (existingCost - newProductsCost) < 0 ? 0 : existingCost - newProductsCost;
            updatedProductsList = !newQuantity ? [...updatedProductsList] : [...updatedProductsList, { productId, quantity: newQuantity, costPerUnit, cost: newCost }];
            finalTotalCost = finalTotalCost - newProductsCost < 0 ? 0 : (finalTotalCost - newProductsCost);
        }
    });
    return { products: updatedProductsList, totalCost: finalTotalCost };
}

// Exporting Request Handlers
module.exports = {
    getCart,
    createOrupdateCart,
}