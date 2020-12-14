import { BaseCommand } from './base_command.js';
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
                description: '--reward-remove-role <@Role1> <@Role2> ... <@Role3> : Removes the mentioned roles from the list',
                title: 'Remove reward roles'
            }
        ];
        super('config', description, args);
    }
}

export { Config };