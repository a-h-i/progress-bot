import { BaseCommand } from './base_command.js';
import { MessageEmbed } from 'discord.js';
import { PROJECT_HOME_PAGE, CAPITALIZED_BOT_NAME, EMBED_FOOTER_ARGS, EMBED_COLOR } from '../config/index.js';
const description = `Lists available commands.
use help <command_name> to list help about a specific command`;

class Help extends BaseCommand {
    constructor(){
        super('help', description, []);
    }
    
    execute(message, guildConfig) {
        const args = BaseCommand.argsArray(message, guildConfig);
        if(args.length <= 1) {
            // List commands
            return this.listCommands(message, guildConfig);
        } else {
            // Help with specific command
            const command = args[1].toLowerCase();
            if(message.client.commands.has(command)) {
                return message.reply(message.client.commands.get(command).createHelpEmbed());
            } else {
                // unknown commands
                return this.listCommands(message, guildConfig);
            }
        }
    }

    listCommands(message, guildConfig) {
        const commandNames = [...message.client.commands.keys()].join('\n');
        const helpEmbed = new MessageEmbed();
        helpEmbed.setTitle(`${CAPITALIZED_BOT_NAME} Bot`).setURL(PROJECT_HOME_PAGE);
        const embedDescription = `For help with a specific command
use ${guildConfig.prefix}help <command>`;
        helpEmbed.setDescription(embedDescription);
        helpEmbed.addField('Available commands', commandNames, false);
        helpEmbed.setFooter(...EMBED_FOOTER_ARGS);
        helpEmbed.setColor(EMBED_COLOR);
        return message.reply(helpEmbed);

    }
}

export { Help };