import { BaseCommand } from './base_command.js';
import { Character, sequelize } from '../models/index.js';
import { logger, INTERACTIVE_DEFAULT_TIMEOUT } from '../config/index.js';

const description = `Retire one of your characters by name.
usage: retire Character Name
`;

/**
 * Retire one of your characters by name.
 * usage: retire Character Name
 */
class RetireCharacter extends BaseCommand {
    constructor() {
        super('retire', description, []);
    }

    async execute(message, guildConfig) {
        if (message.argsArray.length < 1) {
            // no name specified
            return message.reply(this.createHelpEmbed());
        }
        const charName = BaseCommand.removeLeadingAndTrailingQuoutes(message.argsArray.join(' '));
        const transaction = await sequelize.transaction();
        try {

            const character = await Character.retire(guildConfig.id, message.author.id,
                charName, transaction);
            if (character == null) {
                return message.reply(`You do not have a non retired character named ${charName}`);
            } else {
                // Delete if lower than retirementKeepLevel
                if (character.level < guildConfig.retirementKeepLevel) {
                    character.destroy({ transaction: transaction });
                }
                // Confirm
                const promptMessage = await message.reply(`Reply with yes to Confirm retirement of ${character.name} - level ${character.level}
reply with anything else to cancel.`);
                const filter = (reply) => reply.author.id == message.author.id;
                const collected = await message.channel.awaitMessages(filter, {
                    max: 1,
                    time: INTERACTIVE_DEFAULT_TIMEOUT
                });
                let commit = false;
                if (collected.size == 0) {
                    await promptMessage.edit('Response timed out');
                } else if (collected.first().content.trim().toLowerCase() === 'yes') {
                    commit = true;
                    await message.reply('Confirmed');
                } else {
                    await message.reply('Canceled');
                }
                if (commit) {
                    return transaction.commit();
                } else {
                    return transaction.rollback();
                }
            }    
        } catch (err) {
            logger.error('Error in retire command execution');
            logger.error(err);
            await transaction.rollback();
            throw err;
        }
        
    }
}

export { RetireCharacter };