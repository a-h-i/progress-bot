import * as Command from '../../commands/index.js';
import { TestScenario } from './test_scenario.js';

class ClientMock {

    constructor() {
        this.guilds = new Map();
        this.commandsHandler = new Command.CommandHandler();
        for ( const commandClass of Command.commandClasses) {
            this.commandsHandler.registerCommand(new commandClass());
        }
    }

    addGuild(guild) {
        this.guilds.set(guild.id, guild);
    }

    createScenario(guild) {
        return new TestScenario(this, guild);
    }

    /**
     * @returns {GuildMock}
     */
    firstGuild() {
        return this.guilds.values().next().value;
    }

}

export { ClientMock };