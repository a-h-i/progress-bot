import { GuildConfig, Character } from "../../models/index.js";
import { ClientMock, GuildMock, MessageMock, RoleMock, UserMock } from "../mocks/index.js";
import { v4 as uuidv4 } from 'uuid';

describe('RegisterCommand', function() {
    let clientMock, author;
    const guildId = uuidv4();
    const authorId = uuidv4();
    const registerRoleId = uuidv4();
    const otherUserIds = [ uuidv4(), uuidv4() ];

    before(async function() {
        clientMock = new ClientMock();
        const guild = new GuildMock(guildId);
        const registerRole = new RoleMock(registerRoleId, guild, {
            name: 'register'
        });
        guild.roles.create(registerRole);
        author = new UserMock(authorId, guild);
        author.roles.create(registerRole);
        guild.members.create(author);
        for (const id of otherUserIds) {
            guild.members.create(new UserMock(id, guild));
        }
        clientMock.addGuild(guild);
        const [ guildRecord ] = await GuildConfig.findOrCreate({ where: {
            id: guildId,
            prefix: '$'
        } });
        guildRecord.addCharCreationRole(registerRole.id);
        await guildRecord.save();
    });

    describe('$register @User', function () { 
        let scenario;
        let charOwner;
        const charName = 'Percy';
        before(async function() {
            const guild = clientMock.firstGuild();
            scenario = clientMock.createScenario(guild);
            charOwner = clientMock.firstGuild().members.cache.get(otherUserIds[0]);
            scenario.queueMessage(new MessageMock(clientMock, scenario, author, [ '$register', charOwner, charName ]));
            await scenario.run(); 
        });

        it('should create character with default values', async function() {
            
            scenario.hasReplies().should.be.true;
            const guildConfig = await GuildConfig.findByPk(guildId);
            let count = await Character.count({
                where: {
                    guildId: guildId,
                    userId: charOwner.id,
                    isActive: true,
                    name: charName,
                    level: guildConfig.startingLevel,
                    gold: guildConfig.startingGold,
                    experience: Character.getXpFromLevel(guildConfig.startingLevel)
                }
            });
            count.should.equal(1);
        });

        it('Reply should include character name', function() {
            scenario.hasReplies().should.be.true;
            const reply = scenario.popReply();
            reply.content.should.contain(charName);
        });

        after(async function() {
            await Character.destroy({ where: {
                guildId: guildId,
                name: charName,
                userId: charOwner.id
            } });
        });


    });

    describe('With unauthorized author', function () {
        let scenario;
        let charOwner;
        const charName = 'Jackson';
        before(async function() {
            const guild = clientMock.firstGuild();
            scenario = clientMock.createScenario(guild);
            charOwner = clientMock.firstGuild().members.cache.get(otherUserIds[0]);
            scenario.queueMessage(new MessageMock(clientMock, scenario, clientMock.firstGuild().members.cache.get(otherUserIds[1]), [ '$register', charOwner, charName ]));
            await scenario.run(); 
        });

        it('should create character with default values', async function() {
            
            scenario.hasReplies().should.be.true;
            let count = await Character.count({
                where: {
                    guildId: guildId,
                    userId: charOwner.id,
                    name: charName
                }
            });
            count.should.equal(0);
        });

        it('Should return unauthorized response', function() {
            scenario.hasReplies().should.be.true;
            const reply = scenario.popReply();
            reply.content.should.contain('not allowed to use this command.');
        });

        after(async function() {
            await Character.destroy({ where: {
                guildId: guildId,
                name: charName,
                userId: charOwner.id
            } });
        });
        

    });

    after(async function() {
        await GuildConfig.destroy({ where: {
            id: guildId
        } });
    });
});