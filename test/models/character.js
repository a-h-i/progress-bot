import { Character, GuildConfig, sequelize } from '../../models/index.js';


describe('Character', function() {

    describe('getXpFromLevel()', function() {

        it('Should get experience', function() {
            Character.getXpFromLevel(6).should.equal(14000, 'level 6 experience');
        });

        it('Should enforce a minumum level of 1', function() {
            Character.getXpFromLevel(0).should.equal(0, 'level 0 experience');
            Character.getXpFromLevel(1).should.equal(0, 'level 1 experience');
            Character.getXpFromLevel(-2).should.equal(0, 'level -2 experience');
        });

        it('Should enforce a maximum level of 20', function() {
            Character.getXpFromLevel(20).should.equal(355000, 'level 20 experience');
            Character.getXpFromLevel(22).should.equal(355000, 'level 22 experience');
        });
    });

    describe('getLevelFromXp', function() {

        it('Should get level from exact experience', function() {
            Character.getLevelFromXp(85000).should.equal(11, 'level 11 experience');
        });

        it('should get level from in between experience', function() {
            Character.getLevelFromXp(152320).should.equal(14, 'between levels 14 and 15 experience');
        });

        it('Should enforce a minimum of level 1', function() {
            Character.getLevelFromXp(0).should.equal(1, 'zero xp');
            Character.getLevelFromXp(-120).should.equal(1, 'negative xp');
            Character.getLevelFromXp(-0.2).should.equal(1, 'slight negative xp');
        });

        it('Should enforce a maximum of level 20', function() {
            Character.getLevelFromXp(355000).should.equal(20);
            Character.getLevelFromXp(355001).should.equal(20, 'more than level 20 xp');
            Character.getLevelFromXp(400000).should.equal(20, 'much more than level 20 xp');
        });

    });

    describe('registernewCharacter()', function() {
        const guildId = 'test:character:guild01';
        
        before(async function() {
            await GuildConfig.create({
                id: guildId,
                startingLevel: 3,
                startingGold: 300
            });
        });

        after(async function() {
            await GuildConfig.destroy({ truncate: true, cascade: true });
        });

        afterEach(async function() {
            await Character.destroy({
                where: {
                    guildId: guildId
                }
            });
        });
        

        it('Should create new character and set it as active if it only character', async function() {
            const userId = 'test:character:user01';
            const preRegisterCount = await Character.count({
                where: {
                    guildId: guildId,
                    userId: userId
                }
            });
            preRegisterCount.should.equal(0, 'starts with zero characters');
            const character = await Character.registerNewCharacter(guildId, userId,
                'Test Character 1', 900, 100);
            character.experience.should.equal(900, 'experience');
            character.isActive.should.be.true;
            character.isRetired.should.be.false;
            character.level.should.equal(3, 'computed level');
            character.gold.should.equal(100, 'gold');
            character.userId.should.equal(userId);
            character.guildId.should.equal(guildId);
            const postRegisterCount = await Character.count({
                where: {
                    guildId: guildId,
                    userId: userId,
                    isActive: true
                }
            });
            postRegisterCount.should.equal(1, 'Exactly one character');
        });

        it('Should create a new character and not set it as active if there exists another character ', async function() {
            const userId = 'test:character:user01';
            const charNames = [ 'Character 1', 'Character 2' ];

            const transaction = await sequelize.transaction();
            try {
                const preRegisterActiveCount = await Character.count({
                    where: {
                        guildId: guildId,
                        userId: userId,
                        isActive: true
                    }, transaction: transaction
                });
                preRegisterActiveCount.should.equal(0);
                for (const name of charNames) {
                    await Character.registerNewCharacter(guildId, userId, name, 900, 100, transaction);
                }
                await transaction.commit();
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
            const postRegisterCount = await Character.count({
                where: {
                    guildId: guildId,
                    userId: userId,
                    isActive: true
                }
            });
            postRegisterCount.should.equal(1);
            const activeChar = await Character.findOne( { where: {
                guildId: guildId,
                userId: userId,
                isActive: true
            } });
            return activeChar.name.should.equal(charNames[0]);
        });
    });

    describe('setActive', function() {
        let characters = [];
        const userId = 'test:character:user02';
        before(async function () {
            const transaction = await sequelize.transaction();
            const guildConfig = await GuildConfig.create({
                id: 'test:character:guild02',
                startingLevel: 3,
                startingGold: 300
            }, {
                transaction: transaction
            });
            characters.push(await Character.registerNewCharacter(guildConfig.id,
                userId, 'Character 1', guildConfig.startingLevel, guildConfig.startingGold, transaction));
            characters.push(await Character.registerNewCharacter(guildConfig.id,
                userId, 'Character 2', guildConfig.startingLevel, guildConfig.startingGold, transaction));
            characters.push(await Character.registerNewCharacter(guildConfig.id,
                userId, 'Character 3', guildConfig.startingLevel, guildConfig.startingGold, transaction));
            await transaction.commit();
        });

        it('Changes active character', async function() {
            characters.length.should.be.greaterThan(1);
            const priorActiveCharacter = await Character.findOne({
                where: {
                    guildId: characters[0].guildId,
                    userId: characters[0].userId,
                    isActive: true
                } 
            });
            priorActiveCharacter.name.should.equal(characters[0].name);
            const returnValue = await Character.setActive(characters[0].guildId, 
                userId, characters[characters.length - 1].name);
            returnValue.should.be.instanceOf(Character);
            returnValue.isActive.should.be.true;
            returnValue.name.should.equal(characters[characters.length - 1].name);
            const activeCount = await Character.count({
                where: {
                    guildId: characters[0].guildId,
                    userId: characters[0].userId,
                    isActive: true
                }
            });
            activeCount.should.equal(1);
        });

        it('Should not change active character when invalid name given', async function() {
            const priorActiveCharacter = await Character.findOne({
                where: {
                    guildId: characters[0].guildId,
                    userId: characters[0].userId,
                    isActive: true
                } 
            });

            const returnValue = await Character.setActive(characters[0].guildId, 
                userId, characters.join('-'));
            // eslint-disable-next-line no-undef
            expect(returnValue).to.be.null;
            const postActiveCharacter = await Character.findOne({
                where: {
                    guildId: characters[0].guildId,
                    userId: characters[0].userId,
                    isActive: true
                } 
            });
            postActiveCharacter.name.should.equal(priorActiveCharacter.name);
            const activeCount = await Character.count({
                where: {
                    guildId: characters[0].guildId,
                    userId: characters[0].userId,
                    isActive: true
                }
            });
            activeCount.should.equal(1);
        });

        after(async function() {
            await GuildConfig.destroy({ truncate: true, cascade: true });
        });
    });
});