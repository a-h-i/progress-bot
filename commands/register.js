import { BaseCommand } from './base_command.js';
import { Character } from '../models/index.js';
import { logger } from '../config/index.js';
import { displayCharDetails } from '../helpers/index.js';

const XP_REGEX = /(?<num>\d+)xp/i;
const GOLD_REGEX = /(?<num>\d+(?:\.\d+)?)gold/i;

const description = `Register a new character for a user
usage : register @User Character Name
A character will be created with character name for the mentioned user.
To override the starting xp or gold use one or both of the flags as such
register @User Character Name 6400xp 500gold
Note: character name can not start with -- or angle bracket < >
`;

/**
 * Register a new character for a user.
 * Must mention exactly one user.
 * usage : register @User Character Name
 * A character will be created with character name for the mentioned user.
 * To override the starting xp or gold use one or both of the flags as such
 * register @User Character Name 6400xp 500gold
 * Ignores leading and trailing double or single quotes on a character name.
 * Character name can not start with double dash.
 */
class Register extends BaseCommand {
    constructor() {
        const args = [ {
            name: 'xp',
            description: 'usage  500xp. Optional',
            title: 'starting xp override'
        }, 
        {
            name: 'gold',
            description: 'usage 3000gold. Optional',
            title: 'Starting gold override'
        } ];
        super([ 'register' ], description, args);
    }

    async execute(message, guildConfig) {
        if (!this.hasPermission(message.member, guildConfig.getCharCreationRolesAsMap())) {
            return this.standardNotAllowedMessage(message);
        }
        if (message.argsArray.length < 2 || message.mentions.users.size == 0 ) {
            // must at least have a mention and a character name.
            return message.reply(this.createHelpEmbed());
        }
        let startingGold = guildConfig.startingGold;
        let startingXp = Character.getXpFromLevel(guildConfig.startingLevel);
        const userId = message.mentions.users.first().id;
        let charName = [];
        
        while (message.argsArray.length > 0) {
            let currentArg = message.argsArray.shift();
            if (currentArg.startsWith('--')) {
                currentArg = currentArg.toLowerCase(); 
            }
            if (currentArg.startsWith('<')) {
                // skip mention
                continue;
            }
            const xpMatch = currentArg.match(XP_REGEX);
            const goldMatch = currentArg.match(GOLD_REGEX);
            if (xpMatch != null) {
                // Handle xp
                const xpValueString = xpMatch.groups.num;
                startingXp = parseInt(xpValueString, 10);
                if (isNaN(startingXp)) {
                    // could not be parsed
                    logger.notice(`Could not parse xp value in register command, value: ${xpValueString}`);
                    return message.reply('Could not parse xp value.');
                }

            } else if (goldMatch != null) {
                // Handle gold
                const goldValueString = goldMatch.groups.num;
                startingGold = parseFloat(goldValueString);
                if (isNaN(startingGold)) {
                    // could not be parsed
                    logger.notice(`Could not parse gold value in register command, value: ${goldValueString}`);
                    return message.reply('Could not parse gold value.');
                }
            } else {
                // character name token
                charName.push(currentArg);
            }

            
        }

        if (startingGold == Infinity) {
            return message.reply(`Too much gold, max is ${Number.MAX_VALUE}`);
        }

        if (startingXp > Character.MAX_XP) {
            return message.reply(`Too much xp, max is ${Character.MAX_XP}`);
        }

        // transform charname to string
        charName = charName.join(' ');
        charName = BaseCommand.removeLeadingAndTrailingQuoutes(charName).trim();
        if (charName.length == 0) {
            logger.notice('Parsed empty char name');
            return message.reply('Invalid character name.');
        }
        const charCount = await Character.count({
            where: {
                guildId: guildConfig.id,
                userId: userId,
                name: charName
            }
        });
        if (charCount != 0) {
            return message.reply(`User already has a character named ${charName}`);
        }
        const char =  await Character.registerNewCharacter(guildConfig.id, userId,
            charName, startingXp, startingGold);
        
        return message.reply('Created:\n' + displayCharDetails(char));

    }
}

export { Register };