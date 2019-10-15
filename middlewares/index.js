const { jwtHelper: { decodeToken, verifyToken } = {} } = require('../helpers');
const { responseHandler: { sendErrorResponse, } = {} } = require('../utils');


/**
 * To decode token and add logged in user object in req object
 * Deperecated - This fearure is now handled in auth Middleware during token validation
 */
const sessionMiddleware = (req, res, next) => {
    const { headers: { authorization = '' } = {} } = req;
    const token = authorization.startsWith('Bearer') ? authorization.replace('Bearer ', '').trim() : authorization;
    req.user = token ? decodeToken(token) : {};
    next();
};

/**
 * To validate the authorisation token
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

// Exporting middleware methods
module.exports = {
    sessionMiddleware,
    authMiddleware,
}