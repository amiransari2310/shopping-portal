const dbConfig = require('./dbConfig.json');
const authConfig = require('./authConfig.json');

module.exports = {
    dbConfig: dbConfig[process.env.NODE_ENV || 'development'] || dbConfig['development'],
    authConfig: authConfig[process.env.NODE_ENV || 'development'] || authConfig['development'],
}