const { log } = require('./logUtil');

const statusCodeMapping = {
    ok: 200,
    error: 500,
    missingParam: 422,
    badRequest: 400,
    unauthorize: 401,
    forbidden: 403,
};

exports = {
    // Return Success Response To HTTP Request
    sendSuccessResponse: (ctx, status = 'ok', statusCode = 200, content = null, message = 'Success') => {
        log((statusCode === 204) ? 'warn' : 'info', {
            statusCode,
            status,
            data: content,
            message,
            timeStamp: new Date().toString()
        });
        const { req, res } = ctx;
        return res.status(statusCodeMapping[status]).json({
            statusCode,
            status,
            data: content,
            message,
        });
    },

    // Return Success Response To HTTP Request
    sendErrorResponse: (ctx, status = 'error', statusCode = 500, content = null, message = 'Fail') => {
        log('error', {
            statusCode,
            status,
            data: content,
            message,
            timeStamp: new Date().toString()
        });
        const { req, res } = ctx;
        return res.status(statusCodeMapping[status]).json({
            statusCode,
            status,
            error: content,
            message,
        });
    }
};

module.exports = exports;
