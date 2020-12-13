/**
 * A base class for bot commands
 * 
 */
class BaseCommand {
    /**
     * 
     * @param {string} name - the name / key of a command
     * @param {string} description - A user friendly description displayed in help messages
     */
    constructor(name, description) {
        this.name = name;
        this.description = description;
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
}

export { BaseCommand };