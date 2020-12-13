import { BaseCommand } from './base_command.js';
const description = ` configure the bot for your own server
 call with no arguments for interactive mode
 parameter should be prefixed by -- i.e config --prefix $ to set the bot prefix to the $ symbol
 paramaters:
 --list : If present simply lists the current configuration
 --prefix  <string> : set the default prefix, call with no value to get the current prefix
 --starting-level <natural_number> : set the starting level for new characters, defaults to 1. Use with no value to get the current value.
 --starting-gold <positive_real_number> : set the starting gold for new characters, defaults to 0. Use with no value to get the current value, accepts decimals.
 --character-creation-add-roles <@Role1> <@Role2> ... <@Role3> : Allows the mentioned roles to use the create_char command.
 --character-creation-list-roles : list the roles that can create characters
 --character-creation-remove-roles  <@Role1> <@Role2> ... <@Role3> : Removes the mentioned roles from the list of allowed roles.
 --reward-add-roles <@Role1> <@Role2> ... <@Role3> : Allows the mentioned roles use the reward command.
 --reward-list-roles : list the roles that can reward characters with xp and gold
 --reward-remove-roles <@Role1> <@Role2> ... <@Role3> : Removes the mentioned roles from the list 

 Note: 
 Arguments that use mentions can not be combined in the same message.
`;

class Config extends BaseCommand {
    constructor() {
        super('config', description);
    }
}

export { Config };