import { Collection } from "discord.js";


class GuildMemberManagerMock {
    constructor(guild) {
        this.guild = guild;
        this.cache = new Collection();
    }

    async fetch(id) {
        return this.cache.get(id);
    }

    /**
     * 
     * @param {MockUser} user 
     */
    create(user) {
        this.cache.set(user.id, user);     
    }

    /**
     * 
     * @param {string} userId 
     */
    remove(userId) {
        this.cache.delete(userId);
    }
}


export { GuildMemberManagerMock };