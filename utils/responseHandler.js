const statusCodeMapping = {
    ok: 200,
    error: 500,
    missingParam: 422,
    badRequest: 400,
    unauthorize: 401,
};

exports = {
    sendSuccessResponse: (ctx, status = 'ok', statusCode = 200, content = null, message = 'Success') => {
        const { req, res } = ctx;
        return res.status(statusCodeMapping[status]).json({
            statusCode,
            status,
            data: content,
            message,
        });
    },

    sendErrorResponse: (ctx, status = 'error', statusCode = 500, content = null, message = 'Fail') => {
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
