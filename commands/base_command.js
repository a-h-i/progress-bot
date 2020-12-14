import { MessageEmbed } from 'discord.js';
import { EMBED_FOOTER_ARGS, EMBED_COLOR } from '../config/index.js';
/**
 * A base class for bot commands
 * 
 */
class BaseCommand {
    /**
     * 
     * @param {string} name - the name / key of a command
     * @param {string} description - A user friendly short description of command functionality
     * @param {Object[]} commandArguments - Array of objects representing each argument accepted by the command.
     * 
     * The only required key in the argument object is description and title.
     * Description should be a string describing it's usage
     * Title should be an appropriate field title for the help embed.
     * Note that due to rich embed limitations, commands should have no more than 20 possible arguments.
     * for displaying help info to users. Otherwise each subclass may store whatever it wants, such as argument handlers.
     */
    constructor(name, description, commandArguments) {
        this.name = name;
        this.description = description;
        this.commandArguments = commandArguments;
    }
    /**
     * Executes the command
     * @param {Message} message - discord js message object See {@link https://discord.js.org/#/docs/main/stable/class/Message}
     * @param {GuildConfig} _guildConfig - guild configuration
     * @abstract
     * 
     */
    execute(message, _guildConfig) {
        throw new Error('Unimplemented execute method. Message: ' + JSON.stringify(message));
    }
    /**
     * 
     * @param {Message} message - discord js message object See {@link https://discord.js.org/#/docs/main/stable/class/Message}
     * @param {GuildConfig} guildConfig - guild configuration
     * @returns {Array} - array of arguments minus the prefix, might include command
     */
    static argsArray(message, guildConfig) {
        return message.content.slice(guildConfig.prefix).trim().split(/ +/);
    }

    toString() {
        return this.description;
    }

    /**
     * Creates an Embedded message for viewing command's help
     * @returns {MessageEmbed} see {@link https://discord.js.org/#/docs/main/stable/class/MessageEmbed}
     */
    createHelpEmbed() {
        const embed = new MessageEmbed();
        embed.setTitle(`${this.name} command usage`).setColor(EMBED_COLOR);
        embed.setDescription(this.description);
        for(let argument of this.commandArguments) {
            embed.addField(argument.title, argument.description, false);
        }
        embed.setTimestamp().setFooter(...EMBED_FOOTER_ARGS);
        return embed;
    }
}

export { BaseCommand };