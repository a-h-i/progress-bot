import { BaseCommand } from './base_command.js';
import { Character, sequelize, Sequelize } from '../models/index.js';
import { logger } from '../config/index.js';

const description = `Spends gold from your currently active character's balance.
Usage: spend 300.4 on potions
spends 300 gold and 4 silvers. The 'on potions' portion is an optional description.`;

class SpendCommand extends BaseCommand {
    constructor() {
        super('spend', description, []);
    }

    async execute(message, guildConfig) {
        let spendAmmount = parseFloat(message.argsArray.shift());
        if (isNaN(spendAmmount)) {
            return message.reply(this.createHelpEmbed());
        }
        spendAmmount = Math.abs(spendAmmount) * -1;
        const transaction = await sequelize.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ });
        try {
            const activeChar = await Character.getActiveCharacter(message.author.id, guildConfig.id, transaction);
            if (activeChar == null) {
                await transaction.commit();
                return message.reply('No currently active character with this guild.');
            }
            const resultedBalance = activeChar.gold - spendAmmount;
            if (resultedBalance >= 0) {
                const result = await Character.increment({
                    gold: spendAmmount
                }, {
                    where: {
                        userId: activeChar.userId,
                        guildId: activeChar.guildId,
                        name: activeChar.name
                    },
                    transaction: transaction,
                    returning: true
                });
                if (result[0][0].length != 1) {
                    throw new Error(`spend executed increment and affected ${result[0][0].length} rows`);
                }
                await transaction.commit();
                return message.reply(`New balance: ${result[0][0][0].gold}`);
            } else {
                await transaction.commit();
                return message.reply('Current balance does not cover expenditure');
            }

        } catch (err) {
            await transaction.rollback();
            logger.error('Error executing spend command');
            logger.error(err);
            throw err;            
        }
    }
}

export { SpendCommand };