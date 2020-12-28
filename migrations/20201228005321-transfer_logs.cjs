'use strict';

async function up(queryInterface, _Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        const sql = `CREATE TABLE IF NOT EXISTS transfer_logs (
            id bigserial,
            amount double precision NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            guild_id varchar(64) NOT NULL REFERENCES guild_configs(id) ON UPDATE CASCADE ON DELETE CASCADE,
            source_user_id varchar(64) NOT NULL,
            source_char_name varchar(256) NOT NULL,
            destination_user_id varchar(64) NOT NULL,
            destination_char_name varchar(256) NOT NULL,
            PRIMARY KEY (id, guild_id)
        )`;
        await queryInterface.sequelize.query(sql, { transaction: transaction });
        await transaction.commit();
    } catch (err) {
        console.error(err);
        await transaction.rollback();
        throw err;
    }
}

async function down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.query('DROP TABLE IF EXISTS transfer_logs CASCADE');
}

module.exports = {
    up: up,
    down: down
};