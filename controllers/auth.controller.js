const { responseHandler: { sendSuccessResponse, sendErrorResponse, } = {} } = require('../utils');
const { jwtHelper } = require('../helpers');
const { crudService } = require('../services');
const {
    createDataInDb,
    updateDataInDb,
    removeDataFromDb,
    findOneFromDb,
} = crudService;

/**
 * Handles Request To Do User Login
 */
const login = async (req, res) => {
    try {
        const { user, password } = req.body;
        if (!user) {
            sendErrorResponse({ req, res }, 'missingParam', 422, {}, 'Missing Required Param User Name/Email.');
        }
        if (!password) {
            sendErrorResponse({ req, res }, 'missingParam', 422, {}, 'Missing Required Param Password.');
        }
        if (user && password) {
            const query = {
                $or: [{
                    userName: user,
                },
                {
                    emailId: user,
                }],
            };
            const userDoc = await findOneFromDb(query, '', 'users');    // Checking If User Exists
            if (!userDoc) {
                sendErrorResponse({ req, res }, 'ok', 204, {}, 'User Not Found.');
            } else {
                const userObj = userDoc.toObject();
                userObj.password = undefined;
                userDoc.comparePassword(password, async (err, isMatch) => {   // Password Validation
                    if (err) {
                        throw err;
                    } else {
                        if (isMatch) {
                            const token = jwtHelper.generateToken({ ...userObj });     // Generating Token
                            const sessionId = await handleSessionOnLogin(userObj._id, token);
                            sendSuccessResponse(
                                { req, res },
                                'ok', 200,
                                {
                                    user: { ...userObj },
                                    token,
                                    sessionId,
                                },
                                'Login Successfull.'
                            );
                        } else {
                            sendErrorResponse({ req, res }, 'badRequest', 400, err, 'Invalid Credentials.');
                        }
                    }
                });
            }
        }
    } catch (err) {
        console.log(err)
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Login.');
    }
}

/**
 * Handles Request To Do User Logout
 */
const logout = async (req, res) => {
    try {
        const { user: { _id: user } = {} } = req;
        await handleSessionOnLogout(user);
        sendSuccessResponse(
            { req, res },
            'ok', 200,
            {},
            'Logout Successfull.'
        );
    } catch (err) {
        console.log(err)
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Logout.');
    }
}

/**
 * Creates/Updates Session On Login
 * @param {string} user - UserId Of the LoggedIn User
 * @param {string} token - Token
 * @returns {string} sessionId - SessionId Of The Session Created
 */
const handleSessionOnLogin = async (user, token) => {
    try {
        const isSessionExists = await findOneFromDb({ user }, '', 'sessions');
        if (isSessionExists) {
            const sessionObj = isSessionExists.toObject();
            const { _id: id } = sessionObj;
            const updatedSession = { ...sessionObj, token };
            await updateDataInDb(id, updatedSession, 'sessions');
            return id;
        } else {
            const session = await createDataInDb({
                user,
                token,
            }, 'sessions');
            return session._id;
        }
    } catch (err) {
        throw err;
    }
};

/**
 * Removes Session On Logout
 * @param {string} user - UserId Of the LoggedIn User
 */
const handleSessionOnLogout = async (user) => {
    try {
        const session = await findOneFromDb({ user }, '', 'sessions') || {};
        await removeDataFromDb(session._id, 'sessions');
    } catch (err) {
        throw err;
    }
}

// Exporting Request Handlers
module.exports = {
    login,
    logout,
}