module.exports = {};

const DEFAULT_SETTINGS = {
    dialect: 'postgres',
    host: process.env.STATERA_DB_HOST || '127.0.0.1',
    migrationStorageTableSchema: 'sequelize_schema',
    password: process.env.STATERA_DB_PASSWORD,
    username: 'statera_dev',
    port: process.env.STATERA_DB_PORT || '5432'
};

module.exports.development = Object.assign({}, DEFAULT_SETTINGS);
module.exports.development.database = 'statera_dev_db';
module.exports.test = Object.assign({}, DEFAULT_SETTINGS);
module.exports.test.database = 'statera_test_db';
module.exports.production = Object.assign({}, DEFAULT_SETTINGS);
module.exports.production.username = process.env.STATERA_DB_USERNAME;
module.exports.production.database = process.env.STATERA_DB_NAME;




