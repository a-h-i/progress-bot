import { v4 as uuidv4 } from 'uuid';
import { GuildConfig } from '../../models/index.js';
import { ClientMock, GuildMock, MessageMock, UserMock } from '../mocks/index.js';
import { MessageEmbed } from 'discord.js';

describe('ConfigCommand', function() {
    let clientMock, guildMock;
    const guildId = uuidv4();
    before(function() {
        clientMock = new ClientMock();
        guildMock = new GuildMock(guildId);
        clientMock.addGuild(guildMock);
    });

    describe('list', function() {
        let author;
        const authorId = uuidv4();
        before(function() {
            author = new UserMock(authorId, guildMock);
            author.permissions.add(UserMock.Permissions.FLAGS.ADMINISTRATOR);
            guildMock.members.create(author);
        });

        it('Can display empty fields on default uncofigured guild', async function () {
            const scenario = clientMock.createScenario(guildMock);
            scenario.queueMessage(new MessageMock(clientMock, scenario, author, [ '$config list' ]));
            await scenario.run();
            scenario.hasReplies().should.be.true;
            const reply = scenario.popReply().embeds[0];

            reply.should.be.instanceof(MessageEmbed);
            reply.title.should.equal('Current Guild Settings');
            reply.title.should.not.match(/(undefined)|(null)/gi);
            expect(reply.description).to.be.null;
            for (const field of reply.fields) {
                field.name.should.not.match(/(undefined)|(null)/gi);
                field.value.should.not.match(/(undefined)|(null)/gi);
            }
        });

        afterEach(async function() {
            guildMock.members.remove(author.id);
            await GuildConfig.destroy({
                where: {
                    id: guildId
                }
            });
        });
    });
});