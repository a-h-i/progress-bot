
async function up(queryInterface, _Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        const sql =`CREATE TABLE IF NOT EXISTS GuildConfigs (
            id varchar(64)  PRIMARY KEY,
            prefix varchar(64)  DEFAULT NULL,
            startingGold double precision NOT NULL DEFAULT 0,
            rewardRoles jsonb NOT NULL DEFAULT '{}'::jsonb,
            charCreationRoles jsonb NOT NULL DEFAULT '{}'::jsonb,
            startingLevel smallint NOT NULL DEFAULT 1
        )
        `;
        await queryInterface.query(sql, { transaction: transaction });
        await transaction.commit();
    } catch(err) {
        console.error(err);
        await transaction.rollback();
    }
}


async function down(queryInterface, _Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        await queryInterface.query('DROP TABLE IF EXISTS GuildConfigs CASCADE', { transaction: transaction });
        await transaction.commit();
    } catch(err) {
        console.error(err);
        await transaction.rollback();
        throw err;
    }
}


export default { up, down };
