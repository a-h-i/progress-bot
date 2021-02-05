import { Collection, MessageEmbed } from "discord.js";
import { RoleMock } from "./role_mock.js";
import { UserMock } from "./user_mock.js";

class MessageMock {

    constructor(client, scenario, author, tokens, opts={}) {
        this.client = client;
        this.guild = scenario.guild;
        this.channel = scenario;
        this.author = author;
        this.member = author;
        this.opts = opts;
        const stringifiedTokens = [];
        this.mentions = {
            users: new Collection(),
            roles: new Collection()
        };
        this.embeds = [];
        for (const token of tokens) {
            if (token instanceof UserMock) {
                stringifiedTokens.push(`<@${token.id}>`);
                this.mentions.users.set(token.id, token);
            } else if (token instanceof RoleMock) {
                stringifiedTokens.push(`<@&${token.id}`);
                this.mentions.roles.set(token.id, token);
            } else if (token instanceof MessageEmbed) {
                this.embeds.push(token);
            } else {
                stringifiedTokens.push(token);
            }
        }
        this.content = stringifiedTokens.join(' ');
    }


    async reply(content, opts={}) {
        this.channel.queueReply(new MessageMock(this.client, this.channel, null, [ content ], opts));
    }
}


export { MessageMock };
