import Sequelize from 'sequelize';
import { DEFAULT_PREFIX } from '../config/index.js';

/**
 * A configuration model for a specific guild
 * 
 */
class GuildConfig extends Sequelize.Model {


    static initialize(sequelize) {

        GuildConfig.init({
            id: {
                type: Sequelize.DataTypes.STRING(64),
                primaryKey: true,
                allowNull: false,
            },
            prefix: {
                type: Sequelize.DataTypes.STRING(64),
                allowNull: false,
                defaultValue: DEFAULT_PREFIX,
            },
            startingLevel: {
                type: Sequelize.DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1
            },
            startingGold: {
                type: Sequelize.DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0
            },
            rewardRoles: {
                allowNull: false,
                type: Sequelize.DataTypes.JSONB,
                defaultValue: {}
            },
            charCreationRoles: {
                allowNull: false,
                type: Sequelize.DataTypes.JSONB,
                defaultValue: {}
            }
        }, {
            sequelize,
            modelName: 'GuildConfig',
            underscored: true,
            tableName: 'GuildConfigs',
            timestamps: false,
            name: {
                singular: 'GuildConfig',
                plural: 'GuildConfigs'
            }
        });

    }
}


export { GuildConfig };