import Sequelize from 'sequelize';
import { DEFAULT_PREFIX } from '../config/index.js';

/**
 * A configuration model for a specific guild
 * 
 */
class GuildConfig extends Sequelize.Model {


    static initialize(sequelize) {
        // Note that roles json is an object for lookup optimization
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
                defaultValue: 1,
                field: 'starting_level'
            },
            startingGold: {
                type: Sequelize.DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                field: 'starting_gold'
            },
            rewardRoles: {
                allowNull: false,
                type: Sequelize.DataTypes.JSONB,
                defaultValue: {},
                field: 'reward_roles'
            },
            charCreationRoles: {
                allowNull: false,
                type: Sequelize.DataTypes.JSONB,
                defaultValue: {},
                field: 'char_creation_roles'
            },
            rewardFormulas: {
                allowNull: false,
                type: Sequelize.DataTypes.JSONB,
                field: 'reward_formulas',
                defaultValue: {}
            },
            configurationRoles: {
                allowNull: false,
                type: Sequelize.DataTypes.JSONB,
                defaultValue: {},
                field: 'configuration_roles'
            }
        }, {
            sequelize,
            modelName: 'GuildConfig',
            underscored: true,
            tableName: 'guild_configs',
            timestamps: false,
            name: {
                singular: 'guild_config',
                plural: 'guild_configs'
            }
        });

    }
}


export { GuildConfig };