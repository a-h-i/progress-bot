import { BaseCommand } from './base_command.js';
import * as BotConfig from '../config/index.js';
import { GuildConfig } from '../models/index.js';

const description = `Configure the bot for your own server.
Call with no arguments for interactive mode.
Note that arguments that use mentions can **not** be combined in the same message.
`;
// Max retry for valid input in interactive mode config.
const MAX_RETRY_COUNT = 3;

/**
 * configure the bot for your own server
 * call with no arguments for interactive mode
 * parameter should be prefixed by -- i.e config --prefix $ to set the bot prefix to the $ symbol
 * arguments:
 * --list : If present simply lists the current configuration
 * --prefix  <string> : set the default prefix, call with no value to get the current prefix
 * --starting-level <number> : set the starting level for new characters, defaults to 1. Use with no value to get the current value.
 * --starting-gold <positive_real_number> : set the starting gold for new characters, defaults to 0. Use with no value to get the current value, accepts decimals.
 * --character-creation-add-roles <@Role1> <@Role2> ... <@Role3> : Allows the mentioned roles to use the create_char command.
 * --character-creation-list-roles : list the roles that can create characters
 * --character-creation-remove-roles  <@Role1> <@Role2> ... <@Role3> : Removes the mentioned roles from the list of allowed roles.
 * --reward-add-roles <@Role1> <@Role2> ... <@Role3> : Allows the mentioned roles use the reward command.
 * --reward-list-roles : list the roles that can reward characters with xp and gold
 * --reward-remove-roles <@Role1> <@Role2> ... <@Role3> : Removes the mentioned roles from the list 
 *
 * Note: 
 * Arguments that use mentions can not be combined in the same message.
 */
class Config extends BaseCommand {
    constructor() {
        const args = [
            {
                name: '--list',
                description: 'if present simply lists the current configuration',
                title: 'List configuration'
            },
            {
                name: '--prefix',
                description: '--prefix <string> : set the default prefix, call with no value to get the current prefix. Max length of 64',
                title: 'Bot prefix'
            },
            {
                name: '--starting-level',
                description: '--starting-level <number> : set the starting level for new characters, defaults to 1. Use with no value to get the current value. Must be in [1, 20] range',
                default_value: 1,
                title: 'Character starting level'
            },
            {
                name: '--starting-gold',
                description: '--starting-gold <positive_real_number> : set the starting gold for new characters, defaults to 0. Use with no value to get the current value, accepts decimals.',
                default_value: 0,
                title: 'Character starting gold'
            },
            {
                name: '--character-creation-add-roles',
                description: '--character-creation-add-roles <@Role1> <@Role2> ... <@Role3> : Allows the mentioned roles to use the create_char command.',
                title: 'Adding character creation role'
            },
            {
                name: '--character-creation-list-roles',
                description: '--character-creation-list-roles : lists the roles that can create characters',
                title: 'List character creation roles',
            },
            {
                name: '--character-creation-remove-roles',
                description: '--character-creation-remove-roles <@Role1> <@Role2> ... <@Role3> : Removes the mentioned roles from the list of allowed roles.',
                title: 'Remove character creation roles'
            },
            {
                name: '--reward-add-roles',
                description: '--reward-add-roles <@Role1> <@Role2> ... <@Role3> : Allows the mentioned roles use the reward command.',
                title: 'Reward Roles'
            },
            {
                name: '--reward-list-roles',
                description: '--reward-list-roles : lists the roles that can reward characters with xp and gold',
                title: 'List reward roles'
            },
            {
                name: '--reward-remove-roles',
                description: '--reward-remove-roles <@Role1> <@Role2> ... <@Role3> : Removes the mentioned roles from the list',
                title: 'Remove reward roles'
            },
            {
                name: '--config-add-roles',
                description: '--config-add-roles <@Role1> ... <@RoleN> : Allows the mentioned roles to change bot configuration',
                title: 'Config Roles'
            },
            {
                name: '--config-list-roles',
                description: '--config-list-roles : List roles',
                title: 'List config roles'
            },
            {
                name: '--config-remove-roles',
                description: '--config-remove-roles <@Role1> ... <@RoleN> : Remove roles',
                title: 'Config remove roles'
                
            }
        ];
        super('config', description, args);
    }

    execute(message, guildConfig) {
        if (message.argsArray.length == 0) {
            return this.interactiveConfig(message, guildConfig);
        }
    }

    async interactiveConfig(message, guildConfig) {        
        try {
            const states = [
                this.interactiveModePrefix,
                this.interactiveModeStartingLevel,
                this.interactiveModeStartingGold,
                this.interactiveModeCharCreationRoles,
                this.interactiveModeRewardRoles,
                this.interactiveModeConfigRoles
            ];
            
            let success = true;

            for (let i = 0; i < states.length && success ; i++) {
                success = await states[i].call(this, message, guildConfig);
            }

            if (success) {
                await guildConfig.save();
                return message.reply('Configuration saved!');
            } else {
                return message.reply('Configuration canceled, changes not saved.');
            }
            

        } catch (err) {
            console.error('Error handling interactive config');
            console.error(err);
            throw err;
        }
        
    }


    async interactiveModePrefix(message, guildConfig) {
        const prompt = `Plpillars of eternity 2 oswald bugease enter a prefix to be used by the bot. A prefix can have a max of ${BotConfig.MAX_PREFIX_LENGTH} characters
Current prefix is: ${guildConfig.prefix}
Prefix can contain symbols, but not spaces and is case insensitive.
Reply with c to cancel the entire process.
Reply with s to skip this setting, keeping the current value.`;
        const promptMessage = await message.reply(prompt);
        const filter = reply => reply.author.id == message.author.id;
        return message.channel.awaitMessages(filter, {
            max: 1,
            time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT,
            errors: [ 'time' ]
        }).then( collected => {
            const prefix = collected.first().content.trim().toLowerCase();
            if (prefix === 'c') {
                // cancled process;
                return false;
            } else if (prefix === 's') {
                // skipped step.
                return message.reply('Skipping setting.').then( () => true);
            }
            if (GuildConfig.isValidPreixString(prefix)) {
                guildConfig.prefix = prefix;
                return true;
            } else {
                return false;
            }
        }).catch( async () => {
            await promptMessage.edit('Response timed out');
            return false; 
        });

    }

    async interactiveModeStartingLevel(message, guildConfig) {
        const prompt = `Please enter a starting level. A starting level must be in the range [1, 20].
The current starting level is ${guildConfig.startingLevel}.
Reply with c to cancel the entire process.
Reply with s to skip this setting, keeping the current value.`;
        const replyContentRegex = /^([cs]|\d{1,2})$/i;
        const filter = (reply) => {
            return reply.author.id == message.author.id && replyContentRegex.test(reply.content.trim());
        };
        let retryCount = 0;
        do {
            const promptMessage = await message.reply(prompt);
            const collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT
            });
            if (collected.size == 0) {
                // time elapsed before user reply
                await promptMessage.edit('Response timed out');
                return false;
            }
            let level = collected.first().content.trim().toLowerCase();
            if (level === 'c') {
                // canceled
                return false;
            } else if (level === 's') {
                // skipped
                break;
            }
            level = parseInt(level, 10);
            level = parseInt(level, 10);
            if (GuildConfig.isValidStartingLevel(level)) {
                guildConfig.startingLevel = level;
                return true;
            } else {
                await message.reply('Value must be between 1-20.');
                retryCount++;
            }
        } while (retryCount < MAX_RETRY_COUNT);
        // Max retry count reached and no valid value entered.
        await message.reply('Skipping setting.');
        return true;
    }

    async interactiveModeStartingGold(message, guildConfig) {
        const prompt = `Please enter starting gold value. Value must be positive. Decimals are accepted
The current starting gold value is ${guildConfig.startingGold}
Reply with c to cancel the entire process.
Reply with s to skip this setting, keeping the current value.`;
        const filterRegex = /^([cs]|(\d*\.?\d*))$/i;
        const filter = (reply) => reply.author.id == message.author.id && filterRegex.test(reply.content.trim());
        let retryCount = 0;
        do {
            const promptMessage = await message.reply(prompt);
            const collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT
            });
            if (collected.size == 0) {
                // time elapsed before user reply
                await promptMessage.edit('Response timed out');
                return false;
            }
            let gold = collected.first().content.trim().toLowerCase();
            if (gold === 'c') {
                // canceled
                return false;
            } else if (gold === 's') {
                // skipped
                break;
            }
            gold = parseFloat(gold);
            if (GuildConfig.isValidStartingGold(gold)) {
                guildConfig.startingGold = gold;
                return true;
            } else {
                await message.reply('Value must be valid positive decimal.');
                retryCount++;
            }
        } while (retryCount < MAX_RETRY_COUNT);
        // Max retry count reached and no valid value entered.
        await message.reply('Skipping setting.');
        return true;
    }
    



    async roleInteractiveHelper(message, guildConfig, prompt, attributeName) {
        const promptMessage = await message.reply(prompt);
        const filter = (reply) => {
            return reply;
        };
        const collected = await message.channel.awaitMessages(filter, {
            max: 1,
            time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT
        });
        if (collected.size == 0) {
            // time elapsed before user reply
            await promptMessage.edit('Response timed out');
            return false;
        }
        const reply = collected.first();
        const content = reply.content.trim().toLowerCase().charAt(0);

        if (reply.mentions.roles.size != 0) {
            return false;
        } else if (content === 'c') {
            // canceled
            return false;
        } else if (content === 's') {
            // skipped
            return true;
        }
    }
    async interactiveModeCharCreationRoles(message, guildConfig) {
        const prompt = `Please mention the roles you want to have permission to character creation.
Note that setting it this way will replace the current list.
reply with c to cancel or s to skip.`;
        return this.roleInteractiveHelper(message, guildConfig, prompt, 'charCreationRoles');
    }
    async interactiveModeRewardRoles(_message, _guildConfig) {
        return true;
    }
    async interactiveModeConfigRoles(_message, _guildConfig) {
        return true;
    }




    
}

export { Config };