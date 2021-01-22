import { BaseCommand } from './base_command.js';
import { Character, sequelize, Sequelize, TransferLog } from '../models/index.js';
import { logger } from '../config/index.js';

const description = `Transfers money from your currently active character to another character.
usage: transfer 300 @OtherUser Target Character Name
To transfer money to yourself simply mention yourself instead of @OtherUser.`;


class TransferCommand extends BaseCommand {
    constructor() {
        super([ 'transfer' ], description, []);
    }

    async execute(message, guildConfig) {
        if (message.mentions.users.size != 1 || message.argsArray.length < 3) {
            return message.reply(this.createHelpEmbed());
        }
        let amount = parseFloat(message.argsArray.shift());
        if (isNaN(amount)) {
            return message.reply('Could not parse amount');
        }
        amount = Math.abs(amount);
        // Ignore mentioned id in message argsArray
        message.argsArray.shift();
        // remaining tokens should be charName
        const charName = BaseCommand.removeLeadingAndTrailingQuoutes(message.argsArray.join(' '));
        const targetUserAsMember = message.guild.members.cache.get(message.mentions.users.first().id);
        if (!targetUserAsMember) {
            // Target user left guild?
            logger.warn(`Transaction target user is not a guild member ${message.mentions.users.first().id}`);
            return message.reply('Target user is not a guild member.');
        }
        const transaction = await sequelize.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ });
        try {
            const sourceChar = await Character.getActiveCharacter(message.author.id, guildConfig.id, transaction);
            if (!sourceChar) {
                logger.debug('No active character in transaction source.');
                await transaction.rollback();
                return message.reply('You do not have a currently active character');
            }
            if (sourceChar.gold < amount) {
                await transaction.rollback();
                return message.reply('You do not have enough money to complete this transaction');
            }
            if (sourceChar.userId == targetUserAsMember.id && charName == sourceChar.name) {
                await transaction.rollback();
                return message.reply('You successfully moved the gold from your right hand to your left hand');
            }
            const targetCharCount = await Character.count({
                where: {
                    guildId: guildConfig.id,
                    name: charName,
                    userId: targetUserAsMember.id
                },
                transaction: transaction
            });
            if (targetCharCount != 1) {
                await transaction.rollback();
                return message.reply('Could not find target character');
            }
            
            const updatePromises = [];
            updatePromises.push(Character.increment({ gold: amount * -1 }, {
                where: {
                    userId: sourceChar.userId,
                    name: sourceChar.name,
                    guildId: sourceChar.guildId
                },
                transaction: transaction
            }));
            updatePromises.push(Character.increment({ gold: amount }, {
                where: {
                    userId: targetUserAsMember.id,
                    guildId: guildConfig.id,
                    name: charName
                }, 
                transaction: transaction
            }));
            // Log transaction
            updatePromises.push(TransferLog.logTransfer(sourceChar, {
                guildId: guildConfig.id,
                userId: targetUserAsMember.id,
                name: charName
            }, amount, transaction));

            await Promise.all(updatePromises);
            await transaction.commit();
            return message.reply(`Successfully transfered ${amount} gold.`);
        } catch (err) {
            logger.error('Error while processing transaction');
            logger.error(err);
            await transaction.rollback();
            throw err();
        }


    }
}

export { TransferCommand };