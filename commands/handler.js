import { BaseCommand } from './base_command.js';
import { GuildConfig } from '../models/index.js';
import * as Config from '../config/index.js';
/**
 * Handles executing commands and detecting guild configurations
 */
class CommandHandler {
    /**
     * 
     * @param {Map} [commands] - map of commands, must extend BaseCommand 
     * @see BaseCommand 
     */
    constructor(commands = new Map()) {
        this.commands = commands;
    }

    /**
     * Handles a message
     * @param {Discord::Message} message - see {@link https://discord.js.org/#/docs/main/stable/class/Message} 
     */
    async handleMessage(message) {
        if (message.author.bot) return;
        try {
            if (!message.guild) {
                // NO associated guild known, such as when using DMs.
                // Limits the ammount of commands that can be executed.
                // TODO: Support DMs
                if (!message.content.startsWith(Config.DEFAULT_PREFIX)) return;
                return message.reply('DMs are currently unsupported.');
            }
            const [ guildConfig ] = await GuildConfig.findOrCreate(
                {
                    where:{
                        id: message.guild.id
                    }
                }
            );
            if (!message.content.startsWith(guildConfig.prefix)) return;
            const argsArray = BaseCommand.argsArray(message, guildConfig.prefix);
            const command = (argsArray.shift() || 'help').toLowerCase();
            if (this.commands.has(command)) {
                return this.commands.get(command).execute(message, guildConfig);
            } else {
                return this.commands.get('help').execute(message, guildConfig);
            }
        } catch (err) {
            console.error('Error in handleMessage');
            console.error(err);
            return message.reply(`Error handling your message, please report the circumstances on our issues page ${Config.ISSUES_URL}`);
        }
    }

    /**
     * 
     * @param {BaseCommand} command - command to register
     */
    registerCommand(command) {
        this.commands.set(command.name, command);
    }


    has(commandName) {
        return this.commands.has(commandName);
    }

    get(commandName) {
        return this.commands.get(commandName);
    }

    commandNames() {
        return this.commands.keys();
    }
    
}




export { CommandHandler };