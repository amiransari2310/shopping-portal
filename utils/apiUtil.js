const yaml = require('js-yaml');
const fs = require('fs');

/**
 * Returns JSON from Swagger File
 */
const getApiSwaggerJson = () => {
    try {
        const yamlPath = `${__dirname}/../apiDocs/swagger.yaml`;
        return yaml.safeLoad(fs.readFileSync(yamlPath, 'utf8'));
    } catch (e) {
        console.log('Error While COnverting YAML to JSON: => ', e);
    }
}

// Exporting API Utility Methods
module.exports = {
    getApiSwaggerJson,
}