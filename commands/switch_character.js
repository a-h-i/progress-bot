import { BaseCommand } from './base_command.js';
import { Character } from '../models/index.js';
import { displayCharDetails } from '../helpers/index.js';

const description = `Switch currently active character.
usage: switch Character Name
If used with no character name will instead display the currently active character, if any`;

/**
 * Switch currently active character.
 * usage: switch Character Name
 */
class SwitchCharacter extends BaseCommand {
    constructor() {
        super([ 'switch', 'active', 'char' ], description, []);
    }

    async execute(message, guildConfig) {
        if (message.argsArray.length < 1) {
            // no name specified
            const char = await Character.getActiveCharacter(message.author.id, guildConfig.id);
            if (char == null) {
                return message.reply(displayCharDetails(char));
            } else {
                return message.reply('No currently active character.');
            }
        }

        const charName = BaseCommand.removeLeadingAndTrailingQuoutes(message.argsArray.join(' '));
        const character = await Character.setActive(guildConfig.id, message.author.id, charName);
        if (character == null) {
            return message.reply(`You do not have a non retired character named ${charName}`);
        } else {
            return message.reply(displayCharDetails(character));
        }
    }
}

export { SwitchCharacter };