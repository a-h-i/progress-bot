import { RoleManagerMock } from "./role_manager_mock.js";
import {Permissions} from 'discord.js';
const DEFAULT_PERMS = [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.READ_MESSAGE_HISTORY, 
Permissions.FLAGS.CHANGE_NICKNAME, Permissions.FLAGS.ADD_REACTIONS];

class UserMock {
    
    constructor(id, guild, data) {
        this.id = id;
        this.roles = new RoleManagerMock(guild);
        if (data) {
            for (const property in data) {
                this.property = data[property];
            }
        }
        this.permissions = new Permissions(DEFAULT_PERMS)
        
    }


    hasPermission(tags, options) {
        if(options.checkAdmin && this.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return true;
        }
        return this.permissions.has(tags)
    }
}

UserMock.Permissions = Permissions;

export { UserMock };