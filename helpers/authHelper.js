/**
 * Return User Object From Request
 * @param {object} req - HTTP Express Request Object
 * @param {object} user - User Object With User Details 
 */
const getUserObject = (req) => {
    const { user = {} } = req;
    return user;
}

module.exports = {
    getUserObject,
}