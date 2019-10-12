const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const { usersRoutes, productsRoutes } = require('./routes');
const { dbUtil, apiUtil } = require('./utils');
const { initConnection, closeConnection, loadData } = dbUtil;
const { getApiSwaggerJson } = apiUtil;

const init = () => {
    (async () => {
        try {
            await initConnection();
            await loadData();
        } catch (err) {
            console.log("Error is => ", err);
        }
    })();
}

/**
 * Creates an express Server
*/
const app = express();
app.set('json spaces', 2);

/**
 * To handle body data/payload for POST/PUT requests
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/users', usersRoutes);
app.use('/products', productsRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getApiSwaggerJson()));

/**
 * If the Node process ends, close the Mongoose connection 
*/
process.on('SIGINT', () => {
    closeConnection();
});

/**
 * Listen for requests
*/
app.listen(3000, err => {
    if (!err) {
        console.log('Server is listening on port: 3000');
        init();
    }
});

module.exports = app;