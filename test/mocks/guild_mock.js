import { GuildMemberManagerMock } from './guild_member_manager_mock.js';
import { RoleManagerMock } from './role_manager_mock.js';

class GuildMock {


    /**
     * 
     * @param {string} id 
     */
    constructor(id) {
        this.id = id;
        this.roles = new RoleManagerMock(this);
        this.members = new GuildMemberManagerMock(this);
    }

    member(user) {
        return this.members.cache.get(user.id);
    }


}


export { GuildMock };