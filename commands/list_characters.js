import { BaseCommand } from './base_command.js';
import { Character } from '../models/index.js';
import Sequelize from 'sequelize';
import { displayCharDetails } from '../helpers/index.js';

const description = `List characters of mentioned user(s) or your characters if no user(s) mentioned
usage: list [@User1 ... @UserN]`;

/**
 * List characters of mentioned user(s) or your characters if no user(s) mentioned
 * usage: list [@User1 ... @UserN]
 */
class ListCharacters extends BaseCommand {
    constructor() {
        super([ 'list', 'chars' ], description, []);
    }

    async execute(message, guildConfig) {
        let users = Array.from(message.mentions.users.values());
        if (users.length == 0) {
            users.push(message.author);
        }

        const characters = await Character.findAll({
            where: {
                guildId: guildConfig.id,
                userId: {
                    [Sequelize.Op.in]: users.map((user) => user.id)
                }
            }
        });
        // create a mapping of useriD -> {name: string, characters: array} with empty arrays first.
        // Name is going to be their set display name/ nickname on the guild.
        const userCharacters = new Map();
        users.forEach((user) => {
            userCharacters.set(user.id, {
                name: message.guild.members.cache.get(user.id).displayName,
                characters: []
            });
        });
        // For all the characters we fetched, assign them to the proper array in our map.
        // Note that we don't add the actual character object, we instead add string representation of a character.
        characters.forEach((character) => {
            userCharacters.get(character.userId).characters.push(displayCharDetails(character));
        });

        let content = '\n'; // start with newline to break from the first reply statement in bot's reply.
        for (const value of userCharacters.values() ) {
            if (value.characters.length == 0) {
                // user has no characters
                content += `**${value.name}** - No characters found\n`;
                
            } else {
                content += `**${value.name}**\n${value.characters.join('\n')}\n`;
            }
        }
        if (content.length == 1) {
            return message.reply('No characters found');
        }
        return message.reply(content);

    }
}


export { ListCharacters };