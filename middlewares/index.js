const { jwtHelper: { decodeToken, verifyToken } = {} } = require('../helpers');
const {
    responseHandler: { sendErrorResponse, } = {},
    logUtil: { log } = {},
} = require('../utils');

/**
 * To decode token and add logged in user object in req object
 * Deperecated - This fearure is now handled in auth Middleware during token validation
 */
// const sessionMiddleware = (req, res, next) => {
//     const { headers: { authorization = '' } = {} } = req;
//     const token = authorization.startsWith('Bearer') ? authorization.replace('Bearer ', '').trim() : authorization;
//     req.user = token ? decodeToken(token) : {};
//     next();
// };

/**
 * To Validate The Authorisation Token
 */
const authMiddleware = async (req, res, next) => {
    const { headers: { authorization = '' } = {} } = req;
    const token = authorization.startsWith('Bearer') ? authorization.replace('Bearer ', '').trim() : authorization;
    if (!token) {
        sendErrorResponse(
            { req, res },
            'badRequest',
            400,
            {},
            message = 'Missing Authorization Token.'
        );
    } else {
        const decodedToken = verifyToken(token);
        if (!decodedToken) {
            sendErrorResponse(
                { req, res },
                'unauthorize',
                401,
                {},
                message = 'Invalid/Expired Token.'
            );
        } else {
            req.user = decodedToken;
            next();
        }
    }
};

/**
 * To Log The Request Details
 */
const logRequestMiddleware = (req, res, next) => {
    log('info', {
        url: req.url,
        method: req.method,
        client: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        message: `'${req.method}' request from '${req.headers['x-forwarded-for'] || req.connection.remoteAddress}' client at ${new Date().toString()}`,
        timeStamp: new Date().toString(),
    });
    next();
}

// Exporting Middleware Methods
module.exports = {
    // sessionMiddleware,
    authMiddleware,
    logRequestMiddleware,
}