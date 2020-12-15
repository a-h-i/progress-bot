import { BaseCommand } from './base_command.js';
import * as BotConfig from '../config/index.js';
import { GuildConfig } from '../models/index.js';

const description = `Configure the bot for your own server.
Call with no arguments for interactive mode.
Note that arguments that use mentions can **not** be combined in the same message.
`;
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
                this.interactiveModeForumulas,
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
        const prompt = `Please enter a prefix to be used by the bot. A prefix can have a max of ${BotConfig.MAX_PREFIX_LENGTH} characters
Current prefix is: ${guildConfig.prefix}
Prefix can contain symbols, but not spaces and is case insensitive.
Reply with c to cancel the entire process.
Reply with s to skip this setting, keeping the current value.
        `;
        await message.reply(prompt);
        const filter = reply => reply.author.id == message.author.id;
        return message.channel.awaitMessages(filter, {
            max: 1,
            time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT,
            errors: [ 'time' ]
        }).then( collected => {
            let prefix = collected.first().content.trim().toLowerCase();
            if (prefix === 'c') {
                // cancled process;
                return false;
            } else if (prefix === 's') {
                // skipped step.
                return true;
            }
            if (GuildConfig.isValidPreixString(prefix)) {
                guildConfig.prefix = prefix;
                return true;
            } else {
                return false;
            }
        }).catch( () => {
            return false; 
        });

    }

    async interactiveModeStartingLevel(_message, _guildConfig) {
        return true;
    }

    async interactiveModeStartingGold(_message, _guildConfig) {
        return true;
    }
    async interactiveModeForumulas(_message, _guildConfig) {
        return true;
    }
    async interactiveModeCharCreationRoles(_message, _guildConfig) {
        return true;
    }
    async interactiveModeRewardRoles(_message, _guildConfig) {
        return true;
    }
    async interactiveModeConfigRoles(_message, _guildConfig) {
        return true;
    }




    
}

export { Config };