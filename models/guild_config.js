import { Model, DataTypes } from 'sequelize';
import { DEFAULT_PREFIX } from '../config/index';
/**
 * A configuration model for a specific guild
 * 
 */
class GuildConfig extends Model {


    static initialize(sequelize) {

        GuildConfig.init({
            id: {
                type: DataTypes.STRING(64),
                primaryKey: true,
                allowNull: false,
            },
            prefix: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: DEFAULT_PREFIX,
            },
            startingLevel: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1
            },
            startingGold: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0
            },
            rewardRoles: {
                allowNull: false,
                type: DataTypes.JSONB,
                defaultValue: {}
            },
            charCreationRoles: {
                allowNull: false,
                type: DataTypes.JSONB,
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