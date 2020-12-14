import { BaseCommand } from './base_command.js';
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
     * 
     * @param {Discord::Message} message - see {@link https://discord.js.org/#/docs/main/stable/class/Message} 
     * @param {GuildConfig} [guildConfig] -  guild configuration option
     */
    handleMessage(message, guildConfig) {
        if (guildConfig === undefined) {
            // NO associated guild known, such as when using DMs.
            // Limits the ammount of commands that can be executed.
            // TODO: Support DMs
            if(!message.content.startsWith(Config.DEFAULT_PREFIX)) return;
            return message.reply('DMs are currently unsupported.');
        }
        const argsArray = BaseCommand.argsArray(message, guildConfig.prefix);
        const command = (argsArray.shift() || 'help').toLowerCase();
        if (this.commands.has(command)) {
            return this.commands.get(command).execute(message, guildConfig);
        } else {
            return this.commands.get('help').execute(message);
        }
    }

    /**
     * 
     * @param {BaseCommand} command - command to register
     */
    registerCommand(command) {
        this.commands[command.name] = command;
    }
}




export { CommandHandler };