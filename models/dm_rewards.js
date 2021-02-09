import Sequelize from 'sequelize';
import * as Math  from 'mathjs';

/**
 * Keeping track of dm rewards
 */
class DMReward extends Sequelize.Model {
    static initialize(sequelize) {
        DMReward.init({
            computedValues: {
                allowNull: false,
                type: Sequelize.DataTypes.JSONB,
                field: 'computed_values',
                defaultValue: {}
            },
            guildId: {
                type: Sequelize.DataTypes.STRING(64),
                allowNull: false,
                field: 'guild_id',
                primaryKey: true,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                references: {
                    model: 'GuildConfig',
                    key: 'id'
                }
            },
            userId: {
                type: Sequelize.DataTypes.STRING(64),
                allowNull: false,
                field: 'user_id',
                primaryKey: true
            }
        }, {
            sequelize,
            modelName: 'DMReward',
            underscored: true, 
            tableName: 'dm_rewards',
            timestamps: false,
            name: {
                singular: 'dm_reward',
                plural: 'dm_rewards'
            }
        });

    }

    /**
     * Does not update underlying storage.
     * @param {Map<String, String>} formulas - variable => formula 
     * @param {number[]} characterLevels - character levels pre-reward
     * @param {number[]} charactersXp - characters' xp pre-reward 
     * @param {number} rewardedXp  
     * @param {number} rewardedGold 
     * @param {number} extraValue 
     * 
     */
    calculate(formulas, characterLevels, charactersXp, rewardedXp, rewardedGold, extraValue) {

        const scope = {
            rewardedGold: rewardedGold,
            rewardedXp: rewardedXp,
            extraValue: extraValue,
            characterLevels: characterLevels,
            charactersXp: charactersXp,
            numberOfCharacters: characterLevels.length,
            averageLevel: characterLevels.reduce((acc, level) => acc + level, 0) / characterLevels.length,
            averageXp: charactersXp.reduce((acc, xp) => acc + xp, 0) / charactersXp.length
        };

        // Previous formula values
        for (const property in formulas) {
            const scopeProperty = `${property}Previous`;
            if (this.computedValues.hasOwnProperty(property)) {
                scope[scopeProperty] = this.computedValues[property];
            } else {
                // starting value
                scope[scopeProperty] = 0;
            }
        }
        const math = Math.create(Math.all);
        const evaluate = math.evaluate;
        math.import({
            import: function () {
                throw new Error('Function import is disabled'); 
            },
            createUnit: function () {
                throw new Error('Function createUnit is disabled'); 
            },
            evaluate: function () {
                throw new Error('Function evaluate is disabled'); 
            },
            parse: function () {
                throw new Error('Function parse is disabled'); 
            },
            simplify: function () {
                throw new Error('Function simplify is disabled'); 
            },
            derivative: function () {
                throw new Error('Function derivative is disabled'); 
            }
        }, { override: true });
        let newComputedValue = {};

        for (const key in formulas) {
            newComputedValue[key] = evaluate(formulas[key], scope);
        }

        Object.assign(this.computedValues, newComputedValue);
        this.changed('computedValues', true);
        this.pruneComputedValues();
    }

    pruneComputedValues() {
        const keysToDelete = [];
        for (const key in this.computedValues) {
            const value = this.computedValues[key];
            if (value == 0 || value == undefined || value == null) {
                keysToDelete.push(key);
            }
        }
        if (keysToDelete.length > 0)  {
            keysToDelete.forEach((key) => delete this.computedValues[key]);
            this.changed('computedValues', true);
        }
    }

    
    displayRewardsTable() {

        if (Object.getOwnPropertyNames(this.computedValues) == 0) {
            return 'No rewards, yet.';
        }
        let lines = [];

        for (const key in this.computedValues) {
            lines.push(`${key} - ${this.computedValues[key]}`);
        }

        return lines.join('\n');
    }

    /**
     * 
     * @param {number} amount 
     * @param {string[]} variables list of variable names to consume in order.
     * @returns {boolean} true if had enough to cover amount, otherwise false and record is unmodified
     */
    consume(amount, variables) {
        const values = new Map();
        let totalAvailable = 0;
        for (const varName of variables) {
            if (this.computedValues.hasOwnProperty(varName)) {
                values.set(varName, this.computedValues[varName]);
                totalAvailable += this.computedValues[varName];
            }
        }
        
        if (totalAvailable < amount) {
            return false;
        }
        
        for (const [ varName, value ] of values) {
            if (amount <= 0 ) {
                break;
            }
            const newValue = value - amount; // remaining value
            amount = amount - value;
            if (newValue <= 0) {
                this.computedValues[varName] = 0;
            } else {
                this.computedValues[varName] = newValue;
            }
        }

        this.changed('computedValues', true);
        this.pruneComputedValues();
        return true;
    }

    /**
     * 
     * @param {string[]} variables 
     * @returns {number} zero on non existant pool names
     */
    getValue(variables) {
        return variables.reduce(( acc, variableName) => {
            if (this.computedValues.hasOwnProperty(variableName)) {
                return acc + this.computedValues[variableName];
            } else {
                return acc;
            }
        }, 0);
    }
}

export { DMReward };