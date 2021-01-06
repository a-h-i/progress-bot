import { GuildConfig, DMReward } from '../../models/index.js';


describe('DMReward', function() {
    describe('#calculate()', function() {
        let guildConfig;
        let dmRewardUser = 'test:dmr:usr1';
        before(async function() {
    
            guildConfig = await GuildConfig.create({
                id: 'test:dmr:guild1'
            });
            await DMReward.create({
                guildId: guildConfig.id,
                userId: dmRewardUser
            });
        });
    
        it('Calculates initial value', async function() {
            const dmReward = await DMReward.findOne({
                where: {
                    guildId: guildConfig.id,
                    userId: dmRewardUser
                }
            });
            dmReward.should.not.be.null;
            Object.getOwnPropertyNames(dmReward.computedValues).should.have.lengthOf(0, 'initially empty');
            const characterLevels = [ 1, 3, 3 ];
            const charactersXp = [ 0, 900, 1200 ];
            const rewardedXp = 400;
            const rewardedGold = 200.5; // 200 gold and five silver pieces
            const extraValue = 0;
            const formulas = {
                gold: 'goldPrevious + 0.5 * rewardedGold',
                xp: 'xpPrevious + 0.1 * rewardedXp + averageXp'
            };
            const averageXp = charactersXp.reduce((prev, curr) => prev + curr) / charactersXp.length;
            const expectedGoldValue = 0 + 0.5 * rewardedGold;
            const expectedXpValue = 0 + 0.1 * rewardedXp + averageXp;
            dmReward.calculate(formulas, characterLevels, charactersXp, rewardedXp, rewardedGold, extraValue);
    
            dmReward.computedValues.should.have.all.keys('gold', 'xp');
            dmReward.computedValues.gold.should.equal(expectedGoldValue);
            dmReward.computedValues.xp.should.equal(expectedXpValue);
        });
    
        it('Does not persist', async function() {
            let dmReward = await DMReward.findOne({
                where: {
                    guildId: guildConfig.id,
                    userId: dmRewardUser
                }
            });
            dmReward.should.not.be.null;
            Object.getOwnPropertyNames(dmReward.computedValues).should.have.lengthOf(0, 'initially empty');
            const characterLevels = [ 1, 3, 3 ];
            const charactersXp = [ 0, 900, 1200 ];
            const rewardedXp = 400;
            const rewardedGold = 200.5; // 200 gold and five silver pieces
            const extraValue = 0;
            const formulas = {
                gold: 'goldPrevious + 0.5 * rewardedGold',
                xp: 'xpPrevious + 0.1 * rewardedXp + averageXp'
            };
            const averageXp = charactersXp.reduce((prev, curr) => prev + curr) / charactersXp.length;
            const expectedGoldValue = 0 + 0.5 * rewardedGold;
            const expectedXpValue = 0 + 0.1 * rewardedXp + averageXp;
            dmReward.calculate(formulas, characterLevels, charactersXp, rewardedXp, rewardedGold, extraValue);
    
            dmReward.computedValues.should.have.all.keys('gold', 'xp');
            dmReward.computedValues.gold.should.equal(expectedGoldValue);
            dmReward.computedValues.xp.should.equal(expectedXpValue);
            dmReward = await DMReward.findOne({
                where: {
                    guildId: guildConfig.id,
                    userId: dmRewardUser
                }
            });
            dmReward.should.not.be.null;
            Object.getOwnPropertyNames(dmReward.computedValues).should.have.lengthOf(0, 'initially empty');
        });
    
        it('Accumalates values', async function() {
            const dmReward = await DMReward.findOne({
                where: {
                    guildId: guildConfig.id,
                    userId: dmRewardUser
                }
            });
            dmReward.should.not.be.null;
            Object.getOwnPropertyNames(dmReward.computedValues).should.have.lengthOf(0, 'initially empty');
            const characterLevels = [ 1, 3, 3 ];
            const charactersXp = [ 0, 900, 1200 ];
            const rewardedXp = 400;
            const rewardedGold = 200.5; // 200 gold and five silver pieces
            const extraValue = 0;
            const formulas = {
                gold: 'goldPrevious + 0.5 * rewardedGold',
                xp: 'xpPrevious + 0.1 * rewardedXp + averageXp'
            };
            const averageXp = charactersXp.reduce((prev, curr) => prev + curr) / charactersXp.length;
            dmReward.computedValues.gold = 50;
            dmReward.computedValues.xp = 10000;
            const expectedGoldValue = dmReward.computedValues.gold + 0.5 * rewardedGold;
            const expectedXpValue = dmReward.computedValues.xp + 0.1 * rewardedXp + averageXp;
            
            dmReward.calculate(formulas, characterLevels, charactersXp, rewardedXp, rewardedGold, extraValue);
    
            dmReward.computedValues.should.have.all.keys('gold', 'xp');
            dmReward.computedValues.gold.should.equal(expectedGoldValue);
            dmReward.computedValues.xp.should.equal(expectedXpValue);
        });
    
        after(async function() {
            await GuildConfig.destroy({ truncate: true, cascade: true });
        }); 
    });

    describe('#consume()', function() {
        let dmReward;
        const xpStartValue = 100;
        const bonusXpStartValue = 50;
        const goldStartValue = 1000.25;
        beforeEach(function() {
            dmReward = DMReward.build({
                computedValues: {
                    xp: xpStartValue,
                    bonusXp: bonusXpStartValue,
                    gold: goldStartValue
                }
            });
        });

        it('Should return false and not change record if amount greater than available', function() {
            const amount = (xpStartValue + bonusXpStartValue) * 2;
            dmReward.consume(amount, [ 'xp' ]).should.be.false;
            dmReward.computedValues.xp.should.equal(xpStartValue);
            dmReward.computedValues.bonusXp.should.equal(bonusXpStartValue);
            dmReward.computedValues.gold.should.equal(goldStartValue);
            dmReward.consume(amount, [ 'xp', 'bonusXp' ]).should.be.false;
            dmReward.computedValues.xp.should.equal(xpStartValue);
            dmReward.computedValues.bonusXp.should.equal(bonusXpStartValue);
            dmReward.computedValues.gold.should.equal(goldStartValue);

        });

        it('Should properly compute for one variable', function() {
            const amount = 100.5;
            dmReward.consume(amount, [ 'gold' ]).should.be.true;
            const expectedGoldValue = goldStartValue - amount;
            dmReward.computedValues.xp.should.equal(xpStartValue);
            dmReward.computedValues.bonusXp.should.equal(bonusXpStartValue);
            dmReward.computedValues.gold.should.equal(expectedGoldValue);
        });

        it('Should properly compute for multiple values', function() {
            const amount = 100;
            const expectedXpValue = 50;
            dmReward.consume(amount, [ 'bonusXp', 'xp' ]).should.be.true;
            dmReward.computedValues.xp.should.equal(expectedXpValue);
            dmReward.computedValues.should.not.have.all.keys('bonusXp');
            dmReward.computedValues.gold.should.equal(goldStartValue);
        });

        it('Should ignore non existant variables', function() {
            const amount = 100;
            const expectedXpValue = 50;
            dmReward.consume(amount, [ 'bonusXp', 'other', 'xp' ]).should.be.true;
            dmReward.computedValues.xp.should.equal(expectedXpValue);
            dmReward.computedValues.should.not.have.all.keys('bonusXp');
            dmReward.computedValues.gold.should.equal(goldStartValue);
            dmReward.computedValues.should.not.have.any.keys('other');
        });

        
    });

});