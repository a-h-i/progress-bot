
async function up(queryInterface) {
    const sql = `ALTER TABLE guild_configs ADD COLUMN reward_pools JSONB NOT NULL DEFAULT '{}'::jsonb`;
    await queryInterface.sequelize.query(sql);
}

async function down(queryInterface) {
    const sql = 'ALTER TABLE guild_configs DROP COLUMN reward_pools CASCADE';
    await queryInterface.sequelize.query(sql);
}


module.exports = {
    up: up,
    down: down
};