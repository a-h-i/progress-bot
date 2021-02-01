import { RoleManagerMock } from "./role_manager_mock.js";

class UserMock {
    
    constructor(id, guild, data) {
        this.id = id;
        this.roles = new RoleManagerMock(guild);
        if (data) {
            for (const property in data) {
                this.property = data[property];
            }
        }
    }


    hasPermission(tags, checkAdmin=false, checkOwner=false) {
        return false;
    }
}

export { UserMock };