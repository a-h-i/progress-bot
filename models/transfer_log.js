import Sequelize from 'sequelize';

/**
 * Keeps a log of an inter-character transfer.
 * Note that both source and destination characters could have been deleted.
 * The log will persist for auditing purposes 
 */
class TransferLog extends Sequelize.Model {
    static initialize(sequelize) {
        TransferLog.init({
            id: {
                type: Sequelize.DataTypes.BIGINT,
                field: 'id',
                primaryKey: true,
                autoIncrement: true
            },
            amount: {
                type: Sequelize.DataTypes.DOUBLE,
                allowNull: false,
                field: 'amount'
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
            },
            sourceUserId: {
                type: Sequelize.DataTypes.STRING(64),
                allowNull: false,
                field: 'source_user_id'
            },
            destinationUserId: {
                type: Sequelize.DataTypes.STRING(64),
                allowNull: false,
                field: 'destination_user_id'
            },
            sourceCharName: {
                type: Sequelize.DataTypes.STRING(256),
                allowNull: false,
                field: 'source_char_name'
            },
            destinationCharName: {
                type: Sequelize.DataTypes.STRING(256),
                allowNull: false,
                field: 'destination_char_name'
            }
        }, {
            sequelize,
            modelName: 'TransferLog',
            underscored: true,
            tableName: 'transfer_logs',
            timestamps: false,
            name: {
                singular: 'transfer_log',
                plural: 'transfer_logs'
            }
        });
    }
    /**
     * Does not check that source and destination characters are in same guild.
     * @param {Character} sourceChar 
     * @param {Character} destinationChar 
     * @param {number} amount 
     * @param {Sequelize.Transaction} [transaction] 
     * @returns {Promise} created TransferLog instance
     */
    static logTransfer(sourceChar, destinationChar, amount, transaction) {
        return TransferLog.create({
            amount: amount,
            guildId: sourceChar.guildId,
            sourceUserId: sourceChar.userId,
            sourceCharName: sourceChar.name,
            destinationUserId: destinationChar.userId,
            destinationCharName: destinationChar.name
        }, {
            transaction: transaction
        });
    }
}

export { TransferLog };