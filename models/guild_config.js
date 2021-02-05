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
            }, 
            retirementKeepLevel: {
                allowNull: false,
                type: Sequelize.DataTypes.SMALLINT,
                defaultValue: 20,
                field: 'retirement_keep_level'
            },
            rewardPools: {
                allowNull: false,
                type: Sequelize.DataTypes.JSONB,
                defaultValue: {},
                field: 'reward_pools'
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

    static isValidRetirementKeepLevel(level) {
        return GuildConfig.isValidStartingLevel(level);
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
     * 
     * @param {string} attribute - attribute name
     * @param {string} role - role id
     */
    addRoleHelper(attribute, role) {
        this.get(attribute)[role] = role;
        this.changed(attribute, true);
    }

    /**
     * 
     * @param {string} attribute - attribute name
     * @param {string} role - role id
     */
    removeRoleHelper(attribute, role) {
        if (this.get(attribute).hasOwnProperty(role)) {
            delete this.get(attribute)[role];
            this.changed(attribute, true);
        }
    }

    addConfigRole(roleId) {
        this.addRoleHelper('configurationRoles', roleId);
    }

    removeConfigRole(roleId) {
        this.removeRoleHelper('configurationRoles', roleId);
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

    addRewardRole(roleId) {
        this.addRoleHelper('rewardRoles', roleId);
    }

    removeRewardRole(roleId) {
        this.removeRoleHelper('rewardRoles', roleId);
    }

    /**
     * @returns {string[]} array of role ids
     */
    getCharCreationRoles() {
        return this.getRolesHelper('charCreationRoles');
    }

    addCharCreationRole(roleId) {
        this.addRoleHelper('charCreationRoles', roleId);
    }

    removeCharCreationRole(roleId) {
        this.removeRoleHelper('charCreationRoles', roleId);
    }

    getRolesHelper(attribute) {
        return Object.getOwnPropertyNames(this.get(attribute));
    }

    /**
     * 
     * @param {string} attribute 
     * @returns {boolean}
     */
    hasRolesHelper(attribute) {
        return this.getRolesHelper(attribute).length > 0;
    }

    /**
     * @returns {boolean}
     */
    hasCreationRoles() {
        return this.hasRolesHelper('charCreationRoles');
    }
    /**
     * @returns {boolean}
     */
    hasRewardRoles() {
        return this.hasRolesHelper('rewardRoles');
    }

    /**
     * @returns {boolean}
     */
    hasConfigRoles() {
        return this.hasRolesHelper('configurationRoles');
    }

    /**
     * Creates and returns a new Map representing the config roles role => role.
     * for better lookup
     * @returns {Map}
     */
    getConfigRolesAsMap() {
        return new Map(Object.entries(this.configurationRoles));
    }

    getCharCreationRolesAsMap() {
        return new Map(Object.entries(this.charCreationRoles));
    }

    /**
     * Creates and returns a new Map representing the reward roles role => role.
     * for better lookup
     * @returns {Map}
     */
    getRewardRolesAsMap() {
        return new Map(Object.entries(this.rewardRoles));
    }


    removeRewardPool(poolName) {
        if (this.hasRewardPool(poolName)) {
            delete this.rewardPools[poolName];
            this.changed('rewardPools', true);
        }
    }

    /**
     * 
     * @param {string} name
     * @returns {string[]} null if no pool  
     */
    getRewardPoolVars(name) {
        if (this.hasRewardPool(name)) {
            return this.rewardPools[name];
        } else {
            return null;
        }
    }
    
    /**
     * 
     * @param {string} name 
     * @return {boolean}
     */
    hasRewardPool(name) {
        return this.rewardPools.hasOwnProperty(name);
    }

    /**
     * 
     * @param {string} poolName 
     * @param {string[]} vars 
     */
    addRewardPool(poolName, vars) {
        this.rewardPools[poolName] = Array.from(vars);
        this.changed('rewardPools', true);
    }

    /**
     * @returns {string[]}
     */
    getRewardPoolNames() {
        return Object.getOwnPropertyNames(this.rewardPools);
    }

    rewardPoolsToString() {
        let replyContent = [];
        for (const poolName in this.rewardPools) {
            replyContent.push(`${poolName}   =   ${this.rewardPools[poolName].join(', ')}`);
        }
        return replyContent.join('\n');
    }



}


export { GuildConfig };