import { BaseCommand } from './base_command.js';
import { MessageEmbed } from 'discord.js';
import * as Config from '../config/index.js';
const description = `Lists available commands.
use help <command_name> to list help about a specific command`;

class Help extends BaseCommand {
    constructor(){
        super('help', description, []);
    }
    


    execute(message, guildConfig) {
        

        const args = BaseCommand.argsArray(message, guildConfig.prefix);
        if (args.length <= 1) {
            // List commands
            return this.listCommands(message, guildConfig);
        } else {
            // Help with specific command
            const command = args[1].toLowerCase();
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
        const helpEmbed = new MessageEmbed();
        helpEmbed.setTitle(`${Config.CAPITALIZED_BOT_NAME} Bot`).setURL(Config.PROJECT_HOME_PAGE);
        helpEmbed.setThumbnail(Config.BOT_ICON_URL);
        const embedDescription = `For help with a specific command
use ${guildConfig.prefix}help <command>`;
        helpEmbed.setDescription(embedDescription);
        helpEmbed.addField('Available commands', commandNames, false);
        helpEmbed.setFooter(...Config.EMBED_FOOTER_ARGS);
        helpEmbed.setColor(Config.EMBED_COLOR);
        return message.reply(helpEmbed);

    }
}

export { Help };