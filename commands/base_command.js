import { MessageEmbed } from 'discord.js';
import * as Config from '../config/index.js';

const LEAD_TRAIL_QUOTES_REGEX = /(^['"])|(['"]$)/g;

/**
 * Captures user ID from a user mention text as it appears in message.content
 */
const USER_ID_REGEX = /<@!?(?<id>\d+)>/;

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
     * @param {GuildConfig} [_guildConfig] - Guild configuration if available
     * @abstract
     * 
     */
    execute(message, _guildConfig) {
        throw new Error('Unimplemented execute method. Message: ' + JSON.stringify(message));
    }
    /**
     * Does not check if prefix exists.
     * @param {Message} message - discord js message object See {@link https://discord.js.org/#/docs/main/stable/class/Message}
     * @param {string} prefix - guild configuration
     * @returns {Array} - array of arguments minus the prefix, might include command
     */
    static argsArray(message, prefix) {
        return message.content.trim().slice(prefix.length).trim().split(/ +/);
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
        embed.setTitle(`${this.name} command usage`).setColor(Config.EMBED_COLOR)
            .setThumbnail(Config.BOT_ICON_URL);
        embed.setDescription(this.description);
        for (let argument of this.commandArguments) {
            embed.addField(argument.title, argument.description, false);
        }
        embed.setTimestamp().setFooter(...Config.EMBED_FOOTER_ARGS);
        return embed;
    }

    /**
     * 
     * @param {discordjs.GuildMemberextends} user - Discord GuildMember
     * @param {Map} allowedRoleids - map of allowed role ids where the ids are keys
     * @param {boolean} [allowAdmin=true] - allow admin
     * @returns {boolean} true if allowed
     */
    hasPermission(user, allowedRoleids, allowAdmin = true) {
        return (allowAdmin && user.hasPermission([ 'MANAGE_GUILD' ], {
            checkAdmin: true, checkOwner: true
        })) || user.roles.cache.some((role) => allowedRoleids.has(role.id));
    }

    
    standardNotAllowedMessage(message) {
        return message.reply('Sorry you are not allowed to use this command.');
    }
    
    /**
     * Removes leading and trailing single or double quotes from str
     * @param {string} str 
     * @returns {string} new string
     */
    static removeLeadingAndTrailingQuoutes(str) {
        return str.replace(LEAD_TRAIL_QUOTES_REGEX, '');
    }

    /**
     * returns the user ID from it's string representation as it apprears in message.content.
     * @param {string} content 
     * @returns null if could not find a user mention format in content. Otherwise the id as a string
     */
    static extractUserIDFromMentionContent(content) {
        const match = content.match(USER_ID_REGEX);
        return match == null ? null : match[0].groups.id;
    }
}

export { BaseCommand };