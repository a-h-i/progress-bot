import Sequelize from 'sequelize';
import { DEFAULT_PREFIX, MAX_PREFIX_LENGTH } from '../config/index.js';

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
                type: Sequelize.DataTypes.STRING(MAX_PREFIX_LENGTH),
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

    
    /**
     * Checks if a string can be used as a prefix
     * @param {string} prefix - string to be checked
     * @returns {boolean} true if it is valid otherwise false
     */
    static isValidPreixString(prefix) {
        const regex = /^\S+$/;
        return  prefix.length <= MAX_PREFIX_LENGTH && regex.test(prefix);
    }


    static isValidStartingLevel(level) {
        return level >= 1 && level <= 20;
    }

    /**
     * 
     * @param {float} gold
     * @returns {boolean} true if valid number
     */
    static isValidStartingGold(gold) {
        return gold >= 0;
    }

    /**
     * 
     * @param {string[]} roles - role ids. 
     */
    setCharCreationRoles(roles) {
        this.setRoleHelper('charCreationRoles', roles); 
    }

    setRewardRoles(roles) {
        this.setRoleHelper('rewardRoles', roles);
    }

    setConfigRoles(roles) {
        this.setRoleHelper('configurationRoles', roles);
    }

    /**
     * 
     * @param {string} attribute - attribute name
     * @param {string[]} roles - role ids
     */
    setRoleHelper(attribute, roles) {
        let valueObject = {};
        roles.forEach((id) => valueObject[id] = id);
        this.set(attribute, valueObject);
    }

    /**
     * @returns {string[]} array of role ids
     */
    getConfigRoles() {
        return this.getRolesHelper('configurationRoles');
    }

    /**
     * @returns {string[]} array of role ids
     */
    getRewardRoles() {
        return this.getRolesHelper('rewardRoles');
    }

    /**
     * @returns {string[]} array of role ids
     */
    getCharCreationRoles() {
        return this.getRolesHelper('charCreationRoles');
    }

    getRolesHelper(attribute) {
        return Object.getOwnPropertyNames(this.get(attribute));
    }

    /**
     * Creates and returns a new Map representing the config roles role => role.
     * for better lookup
     * @returns {Map}
     */
    getConfigRolesAsMap() {
        return new Map(Object.entries(this.configurationRoles));
    }

}


export { GuildConfig };