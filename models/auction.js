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
                field: 'opening_bid_amount'
            },
            instaBuyAmount: {
                type: Sequelize.DataTypes.DOUBLE,
                allowNull: true,
                field: 'insta_buy_amount',
            },
            minimumIncrement: {
                type: Sequelize.DataTypes.DOUBLE,
                allowNull: true,
                field: 'minimum_increment'
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
}

export { Auction };