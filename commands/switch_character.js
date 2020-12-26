import { BaseCommand } from './base_command.js';
import { Character } from '../models/index.js';

const description = `Switch currently active character.
usage: switch Character Name`;

/**
 * Switch currently active character.
 * usage: switch Character Name
 */
class SwitchCharacter extends BaseCommand {
    constructor() {
        super('switch', description, []);
    }

    async execute(message, guildConfig) {
        if (message.argsArray.length < 1) {
            // no name specified
            return message.reply(this.createHelpEmbed());
        }

        const charName = BaseCommand.removeLeadingAndTrailingQuoutes(message.argsArray.join(' '));
        const character = await Character.setActive(guildConfig.id, message.author.id, charName);
        if (character == null) {
            return message.reply(`You do not have a non retired character named ${charName}`);
        } else {
            return message.reply(character.toString());
        }
    }
}

export { SwitchCharacter };