import { BaseCommand } from './base_command.js';
import { Character } from '../models/index.js';
import Sequelize from 'sequelize';

const description = `List characters of mentioned user(s) or your characters if no user(s) mentioned
usage: list [@User1 ... @UserN]`;

/**
 * List characters of mentioned user(s) or your characters if no user(s) mentioned
 * usage: list [@User1 ... @UserN]
 */
class ListCharacters extends BaseCommand {
    constructor() {
        super('list', description, []);
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

        const userCharacters = new Map();
        users.forEach((user) => {
            userCharacters.set(user.id, {
                name: message.guild.members.cache.get(user.id).displayName,
                characters: []
            });
        });
        characters.forEach((character) => {
            userCharacters.get(character.userId).characters.push(character.toString());
        });
        let content = '\n';
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