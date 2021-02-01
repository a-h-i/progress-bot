
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

    async run() {
        return this.client.commandsHandler.handleMessage(this.popMessage());
    }
}

export { TestScenario };