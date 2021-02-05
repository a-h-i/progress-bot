import Sequelize from 'sequelize';

class Auction extends Sequelize.Model {
    static initialize(sequelize) {
        Auction.init({
            createdAt: {
                type: Sequelize.DataTypes.DATE,
                field: 'created_at'
            },
            bidAt: {
                type: Sequelize.DataTypes.DATE,
                field: 'bid_at',
                allowNull: true
            },
            id: {
                type: Sequelize.DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                field: 'id'
            },
            bidAmount: {
                type: Sequelize.DataTypes.DOUBLE,
                allowNull: true,
                field: 'bid_amount'
            },
            openingBidAmount: {
                type: Sequelize.DataTypes.DOUBLE,
                allowNull: false,
                field: 'opening_bid_amount',
                defaultValue: 1
            },
            instaBuyAmount: {
                type: Sequelize.DataTypes.DOUBLE,
                allowNull: true,
                field: 'insta_buy_amount',
            },
            minimumIncrement: {
                type: Sequelize.DataTypes.DOUBLE,
                allowNull: false,
                field: 'minimum_increment',
                defaultValue: 1
            },
            guildId: {
                type: Sequelize.DataTypes.STRING(64),
                allowNull: false,
                field: 'guild_id'
            },
            userId: {
                type: Sequelize.DataTypes.STRING(64),
                allowNull: false,
                field: 'user_id'
            },
            bidderUserId: {
                type: Sequelize.DataTypes.STRING(64),
                field: 'bidder_user_id',
                allowNull: true
            },
            bidderCharName: {
                type: Sequelize.DataTypes.STRING(256),
                allowNull: true,
                field: 'bidder_char_name'
            },
            charName: {
                field: 'character_name',
                type: Sequelize.DataTypes.STRING(256),
                allowNull: false
            },
            title: {
                field: 'title',
                type: Sequelize.DataTypes.TEXT,
                allowNull: false
            },
            description: {
                field: 'description',
                type: Sequelize.DataTypes.TEXT,
                allowNull: true
            },
            isSold: {
                field: 'is_sold',
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isCanceled: {
                field: 'is_canceled',
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        }, {
            sequelize,
            modelName: 'Auction',
            tableName: 'auctions',
            underscored: true,
            timestamps: false,
            name: {
                singular: 'auction',
                plural: 'auctions'
            }
        });
    }

    /**
     * @returns {boolean}
     */
    hasBid() {
        return this.bidAmount !== undefined && this.bidAmount !== null;
    }

    hasInstaBuy() {
        return this.instaBuyAmount !== null && this.instaBuyAmount !== undefined;
    }
    /**
     * Does not check if is a valid bid.
     * Does not deduce gold from character.
     * Only assigns identifying values to bid.
     * @param {number} amount 
     * @param {Character} character bidder
     * @returns {Promise<Auction>}
     */
    async placeBid(amount, character, transaction) {
        
        this.bidAt = Date.now();
        this.bidAmount = amount;
        this.bidderUserId = character.userId;
        this.bidderCharName = character.name;
        return this.save({ transaction: transaction });
    }

    /**
     * Returns true if amount can be bid on auction.
     * @param {number} amount bid amount
     * @returns {boolean}
     */
    canBidAmount(amount) {
        return (this.hasBid() ? this.bidAmount + this.minimumIncrement : this.openingBidAmount )  <= amount; 
    }


    /**
     * 
     * @param {string} guildId
     * @param {Sequelize.Transaction} transaction 
     * @returns {Promise<Auction[]>}
     */
    static findActiveAuctions(guildId, transaction) {
        return Auction.findAll(
            {
                where: {
                    guildId: guildId,
                    isSold: false,
                    isCanceled: false
                },
                transaction: transaction
            }
        );
    }

    static findUserAuctions(guildId, userId, transaction) {
        return Auction.findAll({
            where: {
                guildId: guildId,
                userId: userId,
                isCanceled: false
            },
            transaction: transaction
        });
    }

    /**
     * 
     * @param {string} title
     * @returns {string[]} empty if valid 
     */
    static isValidTitle(title) {
        const errors = [];
        if (title.length < 4) {
            errors.push('Must be at least 4 characters long');
        }
        return errors;
    }

    /**
     * 
     * @param {string} str 
     * @returns {number} null if can not parse
     */
    static parseOpeningBidAmountStr(str) {
        return parseFloat(str);
    }

    /**
     * 
     * @param {string} str 
     * @returns {string[]} empty if valid
     */
    static isValidOpeningBidAmount(str) {
        const errors = [];
        const parsedValue = Auction.parseOpeningBidAmountStr(str);
        if (isNaN(parsedValue)) {
            errors.push(`${str} is not a valid number`);
        }
        if (parsedValue <= 0) {
            errors.push(`Must be greater than zero`);
        }
        return errors;
    }

    /**
     * 
     * @param {string} str 
     * @returns {string[]} empty if valid
     */
    static isValidMinimumIncrement(str) {
        const errors = [];
        const parsedValue = Auction.parseMinimumIncrement(str);
        if (isNaN(parsedValue)) {
            errors.push(`${str} is not a valid number`);
        }
        if (parsedValue <= 0) {
            errors.push(`Must be greater than zero`);
        }
        return errors;
    }

    /**
     * 
     * @param {string} id auction id
     * @param {string} guildId guild id
     * @returns {Promise<Auction>} null if not found
     */
    static async findByPk(id, guildId, options={}) {
        const auction = await super.findByPk(id, options);
        if (auction && auction.guildId == guildId) {
            return auction;
        } else {
            return null;
        }
    }

  

    /**
     * 
     * @param {string} str
     * @returns {number} null if can not parse 
     */
    static parseMinimumIncrement(str) {
        return parseFloat(str);
    }

   
}

Auction.TITLE_REQUIREMENTS = [ 'Must be at least 4 characters long' ];

export { Auction };