import { BaseCommand } from './base_command.js';
import * as Config from '../config/index.js';
const description = `Lists available commands.
use help <command_name> to list help about a specific command`;

class Help extends BaseCommand {
    constructor(){
        super('help', description, []);
    }
    


    execute(message, guildConfig) {
        

        if (message.argsArray.length == 0) {
            // List commands
            return this.listCommands(message, guildConfig);
        } else {
            // Help with specific command
            const command = message.argsArray[0].toLowerCase();
            if (message.client.commandsHandler.has(command)) {
                return message.reply(message.client.commandsHandler.get(command).createHelpEmbed());
            } else {
                // unknown commands
                return this.listCommands(message, guildConfig);
            }
        }
    }

    listCommands(message, guildConfig) {
        const commandNames = [ ...message.client.commandsHandler.commandNames() ].join('\n');
        const helpEmbed = BaseCommand.createBaseEmbed();
        helpEmbed.setTitle(`${Config.CAPITALIZED_BOT_NAME} Bot`);
        const embedDescription = `For help with a specific command
use ${guildConfig.prefix}help <command>`;
        helpEmbed.setDescription(embedDescription);
        helpEmbed.addField('Available commands', commandNames, false);
        return message.reply(helpEmbed);

    }
}

export { Help };