'use strict';

async function up(queryInterface) {
    const sql = [
        'ALTER TABLE transfer_logs DROP CONSTRAINT transfer_logs_pkey',
        'ALTER TABLE transfer_logs ADD PRIMARY KEY(id)'
    ];
    const transaction = await queryInterface.sequelize.transaction();
    try {

        for (const statement of sql) {
            await queryInterface.sequelize.query(statement, { transaction: transaction });
        }

        await transaction.commit();
    } catch (err) {
        console.error(err);
        await transaction.rollback();
        throw err;
    }
}

async function down(queryInterface) {
    const sql = [
        'ALTER TABLE transfer_logs DROP CONSTRAINT transfer_logs_pkey',
        'ALTER TABLE transfer_logs ADD PRIMARY KEY(id, guild_id)'
    ];
    const transaction = await queryInterface.sequelize.transaction();
    try {

        for (const statement of sql) {
            await queryInterface.sequelize.query(statement, { transaction: transaction });
        }

        await transaction.commit();
    } catch (err) {
        console.error(err);
        await transaction.rollback();
        throw err;
    }
}

module.exports = {
    up,
    down
};