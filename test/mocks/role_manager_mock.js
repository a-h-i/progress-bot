import { Collection } from "discord.js";


class RoleManagerMock {
    constructor(guild) {
        this.guild = guild;
        this.cache = new Collection();
    }

    async fetch(id) {
        return this.cache.get(id);
    }

    /**
     * 
     * @param {MockRole} role 
     */
    create(role) {
        this.cache.set(role.id, role);     
    }
}


export { RoleManagerMock };