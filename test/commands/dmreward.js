import { MessageEmbed } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { GuildConfig, DMReward, Character } from '../../models/index.js';
import { ClientMock, GuildMock, MessageMock, UserMock, RoleMock } from '../mocks/index.js';

describe('dmreward', function() {
    let clientMock, guildMock, author;
    const guildId = uuidv4();
    const dmUserId = uuidv4();
    const dmRoleId = uuidv4();
    let character, dmReward;
    const dmVariableValue = 5000.55;

    before(async function() {
        clientMock = new ClientMock();
        guildMock = new GuildMock(guildId);
        
        const dmRole = new RoleMock(dmRoleId, guildMock, { name: 'register' });
        guildMock.roles.create(dmRole);

        author = new UserMock(dmUserId, guildMock, {
            displayName: 'DM'
        });
        author.roles.create(dmRole);

        guildMock.members.create(author);
        clientMock.addGuild(guildMock);

        const [ guild ] = await GuildConfig.findOrCreate({ where: {
            id: guildId
        } });
        guild.rewardFormulas['dm'] = 'dmPrevious + 100';
        guild.changed('rewardFormulas', true);
        guild.addRewardPool('dm', [ 'dm' ]);
        guild.addRewardRole(dmRole.id);
        await guild.save();
    });

    beforeEach(async function() {
        character = await Character.registerNewCharacter(guildId, dmUserId, "Name", 900, 300);
        dmReward = await DMReward.create({
            userId: dmUserId,
            guildId: guildId,
            computedValues: {
                dm: dmVariableValue
            }
        });
    });

    describe('XP consumption', function() {
        it('does not allow fractions in XP', async function() {
            const scenario = clientMock.createScenario(guildMock);
            const rewardValuePrevious = dmReward.computedValues['dm'];
            const goldPrevious = character.gold;
            const experiencePrevious = character.experience;
            rewardValuePrevious.should.equal(dmVariableValue);
            scenario.queueMessage(new MessageMock(clientMock, scenario, author, [ `$dmreward dm 100.5xp ${character.name}` ]));
            await scenario.run();
            scenario.hasReplies().should.be.true;
            const reply = scenario.popReply().embeds[0];
            reply.should.be.instanceof(MessageEmbed);
            await dmReward.reload();
            await character.reload();
            dmReward.computedValues['dm'].should.equal(rewardValuePrevious);
            character.experience.should.equal(experiencePrevious);
            reply.description.should.equal(clientMock.commandsHandler.get('dmreward').description);
            goldPrevious.should.equal(character.gold);
        });

        it('should allow integer consumption', async function() {
            const scenario = clientMock.createScenario(guildMock);
            const rewardValuePrevious = dmReward.computedValues['dm'];
            const experiencePrevious = character.experience;
            const goldPrevious = character.gold;
            rewardValuePrevious.should.equal(dmVariableValue);
            const amount = 100;
            scenario.queueMessage(new MessageMock(clientMock, scenario, author, [ `$dmreward dm ${amount}xp ${character.name}` ]));
            await scenario.run();
            await dmReward.reload();
            await character.reload();
            dmReward.computedValues['dm'].should.equal(rewardValuePrevious - amount);
            character.experience.should.equal(experiencePrevious + 100);
            const reply = scenario.popReply();
            reply.content.should.contain(rewardValuePrevious - amount);
            reply.content.should.not.contain('undefined');
            reply.content.should.not.contain('null');
            goldPrevious.should.equal(character.gold);
        });

        it('Should take absolute value', async function() {
            const scenario = clientMock.createScenario(guildMock);
            const rewardValuePrevious = dmReward.computedValues['dm'];
            const goldPrevious = character.gold;
            const experiencePrevious = character.experience;
            rewardValuePrevious.should.equal(dmVariableValue);
            const amount = 100;
            scenario.queueMessage(new MessageMock(clientMock, scenario, author, [ `$dmreward dm -${amount}xp ${character.name}` ]));
            await scenario.run();
            await dmReward.reload();
            await character.reload();
            dmReward.computedValues['dm'].should.equal(rewardValuePrevious - amount);
            character.experience.should.equal(experiencePrevious + 100);
            const reply = scenario.popReply();
            reply.content.should.contain(rewardValuePrevious - amount);
            reply.content.should.not.contain('undefined');
            reply.content.should.not.contain('null');
            goldPrevious.should.equal(character.gold);
        });
    });

    describe('Gold consumption', function() {
        it('Should allow fractions', async function() {
            const scenario = clientMock.createScenario(guildMock);
            const rewardValuePrevious = dmReward.computedValues['dm'];
            const goldPrevious = character.gold;
            const experiencePrevious = character.experience;
            rewardValuePrevious.should.equal(dmVariableValue);
            const amount = 95.5;
            scenario.queueMessage(new MessageMock(clientMock, scenario, author, [ `$dmreward dm ${amount}gold ${character.name}` ]));
            await scenario.run();
            await dmReward.reload();
            await character.reload();
            dmReward.computedValues['dm'].should.equal(rewardValuePrevious - amount);
            character.experience.should.equal(experiencePrevious);
            character.gold.should.equal(goldPrevious + amount);
            const reply = scenario.popReply();
            reply.content.should.contain(rewardValuePrevious - amount);
            reply.content.should.not.contain('undefined');
            reply.content.should.not.contain('null');
        });

        it('Should allow integer', async function() {
            const scenario = clientMock.createScenario(guildMock);
            const rewardValuePrevious = dmReward.computedValues['dm'];
            const goldPrevious = character.gold;
            const experiencePrevious = character.experience;
            rewardValuePrevious.should.equal(dmVariableValue);
            const amount = 100;
            scenario.queueMessage(new MessageMock(clientMock, scenario, author, [ `$dmreward dm ${amount}gold ${character.name}` ]));
            await scenario.run();
            await dmReward.reload();
            await character.reload();
            dmReward.computedValues['dm'].should.equal(rewardValuePrevious - amount);
            character.experience.should.equal(experiencePrevious);
            character.gold.should.equal(goldPrevious + amount);
            const reply = scenario.popReply();
            reply.content.should.contain(rewardValuePrevious - amount);
            reply.content.should.not.contain('undefined');
            reply.content.should.not.contain('null');

        });

        it('Should take absolute value', async function() {
            const scenario = clientMock.createScenario(guildMock);
            const rewardValuePrevious = dmReward.computedValues['dm'];
            const goldPrevious = character.gold;
            const experiencePrevious = character.experience;
            rewardValuePrevious.should.equal(dmVariableValue);
            const amount = 95.5;
            scenario.queueMessage(new MessageMock(clientMock, scenario, author, [ `$dmreward dm -${amount}gold ${character.name}` ]));
            await scenario.run();
            await dmReward.reload();
            await character.reload();
            dmReward.computedValues['dm'].should.equal(rewardValuePrevious - amount);
            character.experience.should.equal(experiencePrevious);
            character.gold.should.equal(goldPrevious + amount);
            const reply = scenario.popReply();
            reply.content.should.contain(rewardValuePrevious - amount);
            reply.content.should.not.contain('undefined');
            reply.content.should.not.contain('null');
        });
    });

    afterEach(async function() {
        await character.destroy();
        await dmReward.destroy();
    });

    after(async function() {
        await GuildConfig.destroy({ where: {
            id: guildId
        } });
    });

});