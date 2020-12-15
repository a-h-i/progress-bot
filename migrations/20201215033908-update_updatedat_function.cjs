'use strict';

module.exports = {
    up: async (queryInterface, _Sequelize) => {
        const sql = `CREATE OR REPLACE FUNCTION trigger_update_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        `;
        return await queryInterface.sequelize.query(sql);
    },

    down: async (queryInterface, _Sequelize) => {
        const sql = 'DROP FUNCTION IF EXISTS trigger_update_timestamp() CASCADE';
        return await queryInterface.sequelize.query(sql);
    }
};
