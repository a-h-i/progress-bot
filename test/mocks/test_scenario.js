import { Collection } from "discord.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * Mocks channels and organizes test prep
 */
class TestScenario {
    constructor(client, guild) {
        this.messages = [];
        this.receivedReplies = [];
        this.client = client;
        this.guild = guild;
    }

    queueMessage(message) {
        this.messages.push(message);
    }

    popMessage() {
        return this.messages.shift();
    }

    hasMessages() {
        return this.messages.length > 0;
    }

    hasReplies() {
        return this.receivedReplies.length > 0;
    }

    queueReply(message) {
        this.receivedReplies.push(message);
    }

    popReply() {
        return this.receivedReplies.shift();
    }
    
    get replies() {
        return this.receivedReplies;
    }

    async run() {
        return this.client.commandsHandler.handleMessage(this.popMessage());
    }

    /**
     * 
     * @param {function} filter 
     * @param {object} opts 
     * @returns {Prmoise<Collection>}
     */
    async awaitMessages(filter, opts={}) {
        //TODO: Handle intermixed messages
        //TODO: Handle max other than 1
        const collection = new Collection();
        while (this.messages.length) {
            const message = this.popMessage();
            if (filter(message)) {
                collection.set(uuidv4(), message);
                break;
            }
        }
        return collection;
    }
}

export { TestScenario };