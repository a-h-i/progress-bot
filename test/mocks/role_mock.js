
class RoleMock {

    /**
     * 
     * @param {string} id 
     * @param {GuildMock} guild 
     * @param {object} [data]
     */
    constructor(id, guild, data) {
        this.id = id;
        this.guild = guild;
        if (data) {
            for (const property in data) {
                this.property = data[property];
            }
        }
    }
}


export { RoleMock };