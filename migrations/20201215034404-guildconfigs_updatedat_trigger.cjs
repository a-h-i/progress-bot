'use strict';

module.exports = {
    up: async (queryInterface, _Sequelize) => {
        const sql = `CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON guild_configs
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_update_timestamp();
        `;
        return await queryInterface.sequelize.query(sql);
    },

    down: async (queryInterface, _Sequelize) => {
        const sql = 'DROP TRIGGER IF EXISTS set_updated_at ON GuildConfigs CASCADE';
        return await queryInterface.sequelize.query(sql);
    }
};
