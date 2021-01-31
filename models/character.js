import Sequelize from 'sequelize';

const LEVEL_EXPERIENCE_SEQUENCE = [
    0, 300, 900, 2700, 6500, 14000,
    23000, 34000, 48000, 64000, 85000,
    100000, 120000, 140000, 165000,
    195000, 225000, 265000, 305000, 355000
];

/**
 * Class representing a D&D character
 * Tied to a user and a guild.
 */
class Character extends Sequelize.Model {
    static initialize(sequelize) {
        Character.init({
            level: {
                type: Sequelize.DataTypes.SMALLINT,
                allowNull: false,
                field: 'level'
            }, 
            gold: {
                type: Sequelize.DataTypes.DOUBLE,
                allowNull: false,
                field: 'gold'
            },
            experience: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                field: 'experience'
            },
            isActive: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false,
                field: 'is_active'
            },
            isRetired: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false,
                field: 'is_retired'
            },
            userId: {
                type: Sequelize.DataTypes.STRING(64),
                allowNull: false,
                field: 'user_id',
                primaryKey: true
            },
            name: {
                type: Sequelize.DataTypes.STRING(256),
                allowNull: false,
                field: 'name',
                primaryKey: true
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
                    key: 'id',
                    
                }
            }
        }, 
        {
            sequelize,
            modelName: 'Character',
            underscored: true,
            tableName: 'characters',
            timestamps: false,
            name: {
                singular: 'character',
                plural: 'characters'
            }
        });
    }


    /**
     * Creates and saves a new character entry based on the provided values.
     * Is only set to active character if it is the only non retired character.
     * @param {string} guildId 
     * @param {string} userId 
     * @param {string} name 
     * @param {number} experience 
     * @param {number} gold
     * @returns {Promise<Character>} created instance. 
     */
    static async registerNewCharacter(guildId, userId, name, experience, gold, transaction) {
        const isActive = await Character.count({
            where: {
                guildId: guildId,
                userId: userId,
                isActive: true
            },
            transaction: transaction
        }) == 0;
        let boundedXp = experience;
        if (experience < 0) {
            boundedXp = 0;
        } else if (experience > LEVEL_EXPERIENCE_SEQUENCE[LEVEL_EXPERIENCE_SEQUENCE.length - 1]) {
            boundedXp = LEVEL_EXPERIENCE_SEQUENCE[LEVEL_EXPERIENCE_SEQUENCE.length - 1];
        }

        return Character.create({
            guildId: guildId,
            userId: userId,
            name: name,
            gold: gold,
            isActive: isActive,
            isRetired: false,
            experience: boundedXp,
            level: Character.getLevelFromXp(boundedXp)
        }, {
            transaction: transaction
        });

    }

    /**
     * Does nothing if character is retired
     * Updates underlying storage
     * @param {string} guildId 
     * @param {string} userId 
     * @param {string} name 
     * @param {Sequelize.Transaction} [transaction]
     * @returns {Promise<Character>} Instance of updated character or null if no match found.
     */
    static async setActive(guildId, userId, name, transaction) {
        
        const updateResult = await Character.update({
            isActive: true
        }, { 
            where:{
                guildId: guildId,
                userId: userId,
                name: name,
                isRetired: false
            }, 
            transaction: transaction,
            returning: true
        });
        if (updateResult[0] != 0) {
            await Character.update({
                isActive: false,
            }, {
                where: {
                    isActive: true,
                    guildId: guildId,
                    userId: userId,
                    name: {
                        [Sequelize.Op.ne] : name
                    }
                },
                transaction: transaction
            });
        }
        return updateResult[0] == 0 ? null : updateResult[1][0];
    }
    /**
     * Updates underlying storage
     * @param {string} guildId 
     * @param {string} userId 
     * @param {string} name 
     * @param {Sequelize.Transaction} [transaction]
     * @return {Promise <Character>} resolved to updated character or null if no character found
     */
    static async retire(guildId, userId, name, transaction) {
        const updateResult = await Character.update({
            isRetired: true,
            isActive: false
        }, {
            where: {
                guildId: guildId,
                userId: userId,
                name: name
            },
            transaction: transaction,
            returning: true
        });
        return updateResult[0] == 0 ? null : updateResult[1][0];
    }

    /**
     * Retires this instance
     * Updates underlying storage
     * @returns {Promise <Character>}
     */
    retire(transaction) {
        return Character.retire(this.guildId, this.userId, this.name, transaction);
    }
    
    /**
     * Updates underlying storage
     * @returns {Promise}
     */
    setActive(transaction) {
        return Character.setActive(this.guildId, this.userId, this.name, transaction);
    }

    earnGold(amount) {
        this.set('gold', this.gold + amount);
    }

    earnXp(amount) {
        this.set('experience', this.experience + amount);
        this.updateLevel();
    }
  

    static getLevelFromXp(xp) {
        let low = 0;
        let high = LEVEL_EXPERIENCE_SEQUENCE.length - 1;

        while (low <= high) {
            let middle = (low + high) >>> 1;
            if (LEVEL_EXPERIENCE_SEQUENCE[middle] < xp) {
                low = middle + 1;
            } else if (LEVEL_EXPERIENCE_SEQUENCE[middle] > xp) {
                high = middle - 1;
            } else {
                return middle + 1;
            }
        }
        return Math.max(low, 1); // In between values
    }

    


    static getXpFromLevel(level) {
        const indexedLevel = level -1;

        if (indexedLevel < 0) {
            return LEVEL_EXPERIENCE_SEQUENCE[0];
        } else if (indexedLevel >= LEVEL_EXPERIENCE_SEQUENCE.length) {
            return LEVEL_EXPERIENCE_SEQUENCE[LEVEL_EXPERIENCE_SEQUENCE.length - 1];
        } else {
            return LEVEL_EXPERIENCE_SEQUENCE[indexedLevel];
        }
    }


    /**
     * Updates level based on experience field.
     * Does not update underlying storage.
     * Binds experience field to minimum and max possible XP 
     * @returns {number} new level
     */
    updateLevel() {
        if (this.experience < LEVEL_EXPERIENCE_SEQUENCE[0]) {
            this.experience = LEVEL_EXPERIENCE_SEQUENCE[0];
        } else if (this.experience > LEVEL_EXPERIENCE_SEQUENCE[LEVEL_EXPERIENCE_SEQUENCE.length - 1]) {
            this.experience = LEVEL_EXPERIENCE_SEQUENCE[LEVEL_EXPERIENCE_SEQUENCE.length - 1];
        }
        this.set('level', Character.getLevelFromXp(this.experience));
        return this.level;
        
    }
    
    /**
     * 
     * @param {string} userId 
     * @param {string} guildId 
     * @param {Sequelize.Transaction} transaction 
     * @returns {Promise<Character>} resolves to Character instance or null if no active character.
     */
    static getActiveCharacter(userId, guildId, transaction, lock) {
        return Character.findOne({
            where: {
                userId: userId,
                guildId: guildId,
                isActive: true
            }, transaction: transaction,
            lock: lock
        });
    }
}

export { Character };