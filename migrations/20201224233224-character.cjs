'use strict';

async function up(queryInterface, _Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        const sql = `CREATE TABLE IF NOT EXISTS characters (
           created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
           updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
           gold double precision NOT NULL,
           experience integer NOT NULL,
           level smallint NOT NULL,
           is_active boolean NOT NULL DEFAULT FALSE,
           is_retired boolean NOT NULL DEFAULT FALSE,
           guild_id  varchar(64) NOT NULL REFERENCES guild_configs(id) ON UPDATE CASCADE ON DELETE CASCADE,
           user_id varchar(64) NOT NULL,
           name varchar(256) NOT NULL,
           PRIMARY KEY (guild_id, user_id, name)
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
    const transaction = await queryInterface.sequelize.transaction();
    try {
        await queryInterface.sequelize.query('DROP TABLE IF EXISTS characters CASCADE', { transaction: transaction });
        await transaction.commit();
    } catch (err) {
        console.error(err);
        await transaction.rollback();
        throw err;
    }
}

module.exports = {
    up: up,
    down: down
};
