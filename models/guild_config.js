
/**
 * A configuration object for a specific guild
 * 
 */
class GuildConfig {
    constructor(guildId, prefix) {
        this.guildId = guildId;
        this.prefix = prefix;
    }
}

export { GuildConfig };