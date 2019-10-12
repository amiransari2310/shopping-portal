const { jwtHelper: { decodeToken } = {} } = require('../helpers');

const sessionMiddleware = (req, res, next) => {
    const { headers: { authorization = '' } = {} } = req;
    const token = authorization.startsWith('Bearer') ? authorization.replace('Bearer ', '').trim() : authorization;
    req.user = token ? decodeToken(token) : {};
    next();
};

module.exports = {
    sessionMiddleware,
}