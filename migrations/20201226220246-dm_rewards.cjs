'use strict';

async function up(queryInterface, _Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
        const sql = `CREATE TABLE IF NOT EXISTS dm_rewards (
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            guild_id  varchar(64) NOT NULL REFERENCES guild_configs(id) ON UPDATE CASCADE ON DELETE CASCADE,
            user_id varchar(64) NOT NULL,
            computed_values jsonb NOT NULL DEFAULT '{}'::jsonb,
            PRIMARY KEY (guild_id, user_id)
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
        await queryInterface.sequelize.query(
            'DROP TABLE IF EXISTS dm_rewards CASCADE',
            { transaction: transaction }
        );
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