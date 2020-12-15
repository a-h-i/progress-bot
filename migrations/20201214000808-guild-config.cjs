
async function up(queryInterface, _Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        const sql =`CREATE TABLE IF NOT EXISTS guild_configs (
            id varchar(64)  PRIMARY KEY,
            prefix varchar(64)  DEFAULT NULL,
            starting_gold double precision NOT NULL DEFAULT 0,
            reward_roles jsonb NOT NULL DEFAULT '{}'::jsonb,
            char_creation_roles jsonb NOT NULL DEFAULT '{}'::jsonb,
            configuration_roles jsonb NOT NULL DEFAULT '{}'::jsonb,
            reward_formulas jsonb NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            starting_level smallint NOT NULL DEFAULT 1
        )
        `;
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
        await queryInterface.sequelize.query('DROP TABLE IF EXISTS guild_configs CASCADE', { transaction: transaction });
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
