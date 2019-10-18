const {
    responseHandler: { sendSuccessResponse, sendErrorResponse } = {},
    logUtil: { log },
    validationUtil: { validate } = {},
} = require('../utils');
const { jwtHelper } = require('../helpers');
const { crudService } = require('../services');
const {
    createDataInDb,
    updateDataInDb,
    removeDataFromDb,
    findOneFromDb,
} = crudService;

/**
 * Handles Request To Do User Registeration
 */
const register = async (req, res) => {
    try {
        const { error } = validate(req.body, 'users');
        const [isValid, errors] = [!error, error];
        if (isValid) {
            log('info', {
                message: `Creating/Registering User`,
                payload: JSON.stringify(req.body),
                timeStamp: new Date().toString()
            });
            const data = await createDataInDb(req.body, 'users');
            const { _id } = data;
            sendSuccessResponse({ req, res }, 'ok', 201, { _id }, 'Users Record Created/Registered Successfully.');
        } else {
            sendErrorResponse({ req, res }, 'badRequest', 400, errors, 'Invalid User Payload.');
        }
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Creating/Registering User.');
    }
}


/**
 * Handles Request To Do User Login
 */
const login = async (req, res) => {
    try {
        const { user, password } = req.body;
        log('info', {
            message: `Login for User: '${user}'`,
            timeStamp: new Date().toString()
        });
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
                            sendErrorResponse({ req, res }, 'badRequest', 400, {}, 'Invalid Credentials.');
                        }
                    }
                });
            }
        }
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Login.');
    }
}

/**
 * Handles Request To Do User Logout
 */
const logout = async (req, res) => {
    try {
        const { user: { _id: user } = {} } = req;
        log('info', {
            message: `Logout for User: '${user}'`,
            timeStamp: new Date().toString()
        });
        await handleSessionOnLogout(user);
        sendSuccessResponse(
            { req, res },
            'ok', 200,
            {},
            'Logout Successfull.'
        );
    } catch (err) {
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
            log('info', {
                message: `Updating Session For User: '${user}'`,
                timeStamp: new Date().toString()
            });
            const sessionObj = isSessionExists.toObject();
            const { _id: id } = sessionObj;
            const updatedSession = { ...sessionObj, token };
            await updateDataInDb(id, updatedSession, 'sessions');       // Updating Session WIth New Token If Session Already Exists
            return id;
        } else {
            log('info', {
                message: `Creating Session For User: '${user}'`,
                timeStamp: new Date().toString()
            });
            const session = await createDataInDb({      // Creating New Session
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
 * @param {string} user - UserId Of The LoggedIn User
 */
const handleSessionOnLogout = async (user) => {
    try {
        log('info', {
            message: `Clearing Session For User: '${user}'`,
            timeStamp: new Date().toString()
        });
        const session = await findOneFromDb({ user }, '', 'sessions');
        if (session) await removeDataFromDb(session._id, 'sessions');    // Clearing Session on Logout
    } catch (err) {
        throw err;
    }
}

// Exporting Request Handlers
module.exports = {
    register,
    login,
    logout,
}