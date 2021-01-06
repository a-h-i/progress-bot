'use strict';
const indexName = 'transfer_logs_guildid_idx';

async function up(queryInterface) {

    const sql = `CREATE INDEX ${indexName} ON transfer_logs USING HASH (guild_id) `;
    return await queryInterface.sequelize.query(sql);
}

async function down(queryInterface) {
    const sql = `DROP INDEX ${indexName} CASCADE`;
    return await queryInterface.sequelize.query(sql);
}

module.exports = {
    up,
    down
};