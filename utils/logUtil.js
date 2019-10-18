const winston = require('winston');
const consoleSkipEnvs = ['test', 'production'];

let fixTransports = [
    new winston.transports.File({ filename: `${__dirname}/../logs/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${__dirname}/../logs/info.log`, level: 'info' }),
];

// Skipping Console Logs In Test & Production Environment
transports = (!consoleSkipEnvs.includes(process.env.NODE_ENV)) ? [...fixTransports, new winston.transports.Console()] : [...fixTransports];

const logger = winston.createLogger({
    level: 'info',
    transports,
});

/**
 * Function To Log Data
 * @param {string} level - Log Level To Write To Specific File Or Defines Log Type
 * @param {string|object} msg - Content To Log
 * @returns {void} - Just Logs The Content
 */
const log = (level, msg) => {
    switch (level) {
        case 'log':
            logger.info(msg);
            break;
        case 'warn':
            logger.warn(msg);
            break;
        case 'error':
            logger.error(msg);
            break;
        default:
            logger.info(msg);
            break;
    }
}

// Exporting Log Utility Methods
module.exports = { log };