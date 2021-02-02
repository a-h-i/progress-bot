import { Auction, Character, GuildConfig } from '../../models/index.js';
import { displayAuctionShort, formatJSDate, placeBid, releaseBidHold } from '../../helpers/index.js';
import { v4 as uuidv4 } from 'uuid';

describe('Auction', function() {
    describe('model validation', function() {
        describe('isValidTitle(str)', function() {
            it('Should validate min length', function() {
                Auction.isValidTitle('123').should.have.lengthOf(1);
                Auction.isValidTitle('1234').should.have.lengthOf(0);
            });
        });
        describe('isValidOpeningBidAmount(str)', function() {
            it('Should validate number', function() {
                Auction.isValidOpeningBidAmount('five').should.have.lengthOf(1);
            });
            it('Does not accept zero', function() {
                Auction.isValidOpeningBidAmount('0').should.have.lengthOf(1);
            });
            it('Does not accept less than zero', function() {
                Auction.isValidOpeningBidAmount('-0.1').should.have.lengthOf(1);
    
            });
            it('accepts valid', function() {
                Auction.isValidOpeningBidAmount('0.001').should.have.lengthOf(0);
            });
        });
        describe('isValidMinimumIncrement(str)', function() {
            it('Should validate number', function() {
                Auction.isValidMinimumIncrement('five').should.have.lengthOf(1);
            });
            it('Does not accept zero', function() {
                Auction.isValidMinimumIncrement('0').should.have.lengthOf(1);
            });
            it('Does not accept less than zero', function() {
                Auction.isValidMinimumIncrement('-0.1').should.have.lengthOf(1);
    
            });
            it('accepts valid', function() {
                Auction.isValidMinimumIncrement('0.001').should.have.lengthOf(0);
            });
        });
    });

    describe('instance methods', function() {
        const guildId = uuidv4();
        const ownerId = uuidv4();
        const ownerCharName = 'Auction Owner';
        const openingBidAmount = 1000;
        const minimumIncrement = 10.5;
        let auction, guildConfig;
        beforeEach(async function() {
            [ guildConfig ] = await GuildConfig.findOrCreate({
                where: {
                    id: guildId
                }
            });
            await Character.registerNewCharacter(guildConfig.id, ownerId, ownerCharName, 
                Character.getXpFromLevel(guildConfig.startingLevel), guildConfig.startingGold);
            auction = await Auction.create({
                openingBidAmount: openingBidAmount,
                guildId: guildId,
                userId: ownerId,
                charName: ownerCharName,
                title: 'Test Auction',
                minimumIncrement: minimumIncrement
            });
        });

        describe('#hasBid()', function() {
            let bidder;
            beforeEach(async function() {
                bidder = await Character.registerNewCharacter(guildConfig.id, uuidv4(), 'Other', Character.getXpFromLevel(guildConfig.startingLevel), 
                    (auction.openingBidAmount + auction.minimumIncrement) * 10);
            });

            it('should have a bid after bidding', async function() {
                auction.hasBid().should.be.false;
                await auction.placeBid(openingBidAmount + auction.minimumIncrement, bidder);
                auction.hasBid().should.be.true;
            });

            it('should not have a bid when created', function() {
                auction.hasBid().should.be.false;
            });
            
        });

        describe('#canBidAmount(amount)', function() {
            it('should be able to bid openingBidAmount at start', function () {
                auction.canBidAmount(auction.openingBidAmount + auction.minimumIncrement).should.be.true;
                auction.canBidAmount(auction.openingBidAmount + auction.minimumIncrement + 400).should.be.true;
                auction.canBidAmount(auction.openingBidAmount).should.be.true;
            });

            it('Should not be able to bid less than opening + increment at start', function() {
                const badAmount = auction.openingBidAmount - .5;
                auction.canBidAmount(badAmount).should.be.false;
            });

            describe('with bid', function() {
                beforeEach(async function() {
                    const bidder = await Character.registerNewCharacter(guildConfig.id, uuidv4(), 'Other', Character.getXpFromLevel(guildConfig.startingLevel), 
                        (auction.openingBidAmount + auction.minimumIncrement) * 10);
                    await auction.placeBid((auction.openingBidAmount + auction.minimumIncrement) * 3, bidder);
                });

                it('Should be able to bid currentBid + increment', function() {
                    auction.canBidAmount(auction.bidAmount + auction.minimumIncrement).should.be.true;
                });
    
                it('should not be able to place less than curentBid + increment', function() {
                    auction.canBidAmount(auction.bidAmount).should.be.false;
                    auction.canBidAmount(auction.bidAmount + auction.minimumIncrement -.5).should.be.false;

                });
            });
        });

        describe('#placeBid(amount, character, [transaction])', function() {
            let bidder;
            const amount = openingBidAmount + minimumIncrement + 10;
            beforeEach(async function() {
                bidder = await Character.registerNewCharacter(guildConfig.id, uuidv4(), 'Other', Character.getXpFromLevel(guildConfig.startingLevel), 
                    (auction.openingBidAmount + auction.minimumIncrement) * 10);
            });

            it('should set correct amount', async function() {
                await auction.placeBid(amount, bidder);
                auction.bidAmount.should.equal(amount);
            });
            it('should set correct character name', async function() {
                await auction.placeBid(amount, bidder);
                auction.bidderCharName.should.equal(bidder.name);
            });
            it('should set correct bidder user id', async function() {
                await auction.placeBid(amount, bidder);
                auction.bidderUserId.should.equal(bidder.userId);
            });

            it('should set correct bid at time', async function() {
                const prev = Date.now();
                await auction.placeBid(amount, bidder);
                const after = Date.now();
                auction.bidAt.getTime().should.be.within(prev, after);
            });
        });

        afterEach(async function() {
            await GuildConfig.destroy({ where: {
                id: guildId
                
            } });
        });
    });

    describe('displayAuctionShort(auction, [seperator])', function() {
        const guildId = uuidv4();
        const ownerId = uuidv4();
        const ownerCharName = 'Auction Owner';
        const openingBidAmount = 1000;
        const minimumIncrement = 10.5;
        const bidAmount = openingBidAmount + minimumIncrement + 5;
        let auction, bidder;
        beforeEach(async function() {
            const [ guildConfig ] = await GuildConfig.findOrCreate({
                where: {
                    id: guildId
                }
            });
            await Character.registerNewCharacter(guildConfig.id, ownerId, ownerCharName, 
                Character.getXpFromLevel(guildConfig.startingLevel), guildConfig.startingGold);
            auction = await Auction.create({
                openingBidAmount: openingBidAmount,
                guildId: guildId,
                userId: ownerId,
                charName: ownerCharName,
                title: 'Test Auction',
                minimumIncrement: minimumIncrement
            });
            bidder = await Character.registerNewCharacter(guildConfig.id, uuidv4(), 'Other', Character.getXpFromLevel(guildConfig.startingLevel), 
                bidAmount * 2);
        });

        it('should not have undefined fields', function() {
            displayAuctionShort(auction).should.not.contain('undefined');
        });
        it('should not have null fields', function() {
            displayAuctionShort(auction).should.not.contain('null');
        });


        it('should state auction id', function() {
            displayAuctionShort(auction).should.contain(auction.id);
        });

        it('should contain title', function() {
            displayAuctionShort(auction).should.contain(auction.title);
        });
        it('should state that there are no current bids', function() {
            displayAuctionShort(auction).should.match(/no bids/i);
        });
        it('should state opened at date', function() {
            const content = displayAuctionShort(auction);
            content.should.match(/opened at/i);
            content.should.contain(formatJSDate(auction.createdAt));
        });

        it('should state minimum increment', function() {
            const content = displayAuctionShort(auction);
            content.should.contain(auction.minimumIncrement);
            content.should.match(/minimum increment/i);
        });

        it('should state opening bid', function() {
            displayAuctionShort(auction).should.contain(auction.openingBidAmount);
        });

        it('should state owner info', function() {
            const content = displayAuctionShort(auction);
            content.should.contain(`<@${ownerId}>`);
            content.should.contain(ownerCharName);
        });

        it('Should not say no bids if there is a bid', async function() {
            await auction.placeBid(bidAmount, bidder);
            displayAuctionShort(auction).should.not.match(/no bids/i);
        });

        it('should state bidder info', async function () {
            await auction.placeBid(bidAmount, bidder);
            const content = displayAuctionShort(auction);
            content.should.contain(bidAmount);
            content.should.match(/current bid/i);
            content.should.contain(`<@${bidder.userId}>`);
            content.should.contain(bidder.name);
        });

        afterEach(async function() {
            await GuildConfig.destroy({ where: {
                id: guildId         
            } });
        });
    });

    describe('releaseBidHold(auction, [transaction])', function() {
        const guildId = uuidv4();
        const ownerId = uuidv4();
        const ownerCharName = 'Auction Owner';
        const openingBidAmount = 1000;
        const minimumIncrement = 10.5;
        const bidAmount = openingBidAmount + minimumIncrement + 5;
        let auction, bidder;
        beforeEach(async function() {
            const [ guildConfig ] = await GuildConfig.findOrCreate({
                where: {
                    id: guildId
                }
            });
            await Character.registerNewCharacter(guildConfig.id, ownerId, ownerCharName, 
                Character.getXpFromLevel(guildConfig.startingLevel), guildConfig.startingGold);
            auction = await Auction.create({
                openingBidAmount: openingBidAmount,
                guildId: guildId,
                userId: ownerId,
                charName: ownerCharName,
                title: 'Test Auction',
                minimumIncrement: minimumIncrement
            });
            bidder = await Character.registerNewCharacter(guildConfig.id, uuidv4(), 'Other', Character.getXpFromLevel(guildConfig.startingLevel), 
                bidAmount * 2);
            await auction.placeBid(bidAmount, bidder);
        });

        it('Should release held amount', async function() {
            const prevGold = bidder.gold;
            await releaseBidHold(auction);
            await bidder.reload();
            bidder.gold.should.equal(prevGold + bidAmount);
        });
        afterEach(async function() {
            await GuildConfig.destroy({ where: {
                id: guildId
                
            } });
        });
    });

    describe("placeBid(guildId, auctionId, userId, amount)", function() {
        const guildId = uuidv4();
        const ownerId = uuidv4();
        const ownerCharName = 'Auction Owner';
        const openingBidAmount = 1000;
        const minimumIncrement = 10.5;
        const bidAmount = openingBidAmount + minimumIncrement + 5;
        const bidderGold = bidAmount * 2;
        let auction, bidder;
        beforeEach(async function() {
            const [ guildConfig ] = await GuildConfig.findOrCreate({
                where: {
                    id: guildId
                }
            });
            await Character.registerNewCharacter(guildConfig.id, ownerId, ownerCharName, 
                Character.getXpFromLevel(guildConfig.startingLevel), guildConfig.startingGold);
            auction = await Auction.create({
                openingBidAmount: openingBidAmount,
                guildId: guildId,
                userId: ownerId,
                charName: ownerCharName,
                title: 'Test Auction',
                minimumIncrement: minimumIncrement
            });
            bidder = await Character.registerNewCharacter(guildConfig.id, uuidv4(), 'Other', Character.getXpFromLevel(guildConfig.startingLevel), 
                bidderGold);
        });

        describe('No previous bids', function() {

            it('Should handle no found auction error', async function() {
                const badId = auction.id * 5;
                const errors = await placeBid(guildId, badId, bidder.userId, bidAmount);
                errors.length.should.equal(1);
                errors[0].should.match(/no auction found/i);
                errors[0].should.contain(badId);
                await auction.reload();
                auction.hasBid().should.be.false;
                await bidder.reload();
                bidder.gold.should.equal(bidderGold);

            });

            it('Should handle insufficient gold error', async function() {
                const badAmount = bidder.gold + 1;
                const errors = await placeBid(guildId, auction.id, bidder.userId, badAmount);
                errors.length.should.equal(1);
                errors[0].should.contain(`does not have ${badAmount} gold.`);
                errors[0].should.contain(bidder.name);
                await auction.reload();
                auction.hasBid().should.be.false;
                await bidder.reload();
                bidder.gold.should.equal(bidderGold);
            });

            it('should handle amount < opening amount', async function() {
                const badAmount = openingBidAmount - .5;
                const errors = await placeBid(guildId, auction.id, bidder.userId, badAmount);
                errors.length.should.equal(1);
                errors[0].should.contain(openingBidAmount);
                errors[0].should.match(/auction starts at/i);
                await auction.reload();
                auction.hasBid().should.be.false;
                await bidder.reload();
                bidder.gold.should.equal(bidderGold);
            });

            it('should handle no active character', async function() {
                bidder.isActive = false;
                await bidder.save();
                const errors = await placeBid(guildId, auction.id, bidder.userId, bidAmount);
                errors.length.should.equal(1);
                errors[0].should.contain(`<@${bidder.userId}>`);
                await auction.reload();
                auction.hasBid().should.be.false;
                await bidder.reload();
                bidder.gold.should.equal(bidderGold);
            });

            it('Should correctly place bid', async function() {
                const prev = Date.now();
                const errors = await placeBid(guildId, auction.id, bidder.userId, bidAmount);
                const after = Date.now();
                await bidder.reload();
                await auction.reload();
                errors.length.should.equal(0);
                auction.hasBid().should.be.true;
                auction.bidAt.should.not.be.null;
                auction.bidAt.getTime().should.be.within(prev, after);
                auction.bidAmount.should.equal(bidAmount);
                auction.bidderUserId.should.equal(bidder.userId);
                auction.bidderCharName.should.equal(bidder.name);
                bidder.gold.should.equal(bidderGold - bidAmount);
            });
        });

        describe('With previous bid', function() {
            const secondBidAmount = bidAmount + minimumIncrement;
            const secondBidderGold = secondBidAmount * 1.5;
            let secondBidder;
            beforeEach(async function() {
                secondBidder = await Character.registerNewCharacter(guildId, uuidv4(), 'Other 2', Character.getXpFromLevel(5), 
                    secondBidderGold);
                await placeBid(guildId, auction.id, bidder.userId, bidAmount);
                await auction.reload();
                await bidder.reload();
            });

            it('Should handle insuffecient bid amount', async function() {
                const bidderGoldPre = bidder.gold;
                const bidAtPre = auction.bidAt;
                const errors = await placeBid(guildId, auction.id, secondBidder.userId, bidAmount + 0.5 * minimumIncrement);
                await bidder.reload();
                await auction.reload();
                await secondBidder.reload();
                errors.length.should.equal(1);
                errors[0].should.contain(auction.bidAmount + auction.minimumIncrement);
                auction.bidAmount.should.equal(bidAmount);
                auction.hasBid().should.be.true;
                auction.bidderUserId.should.equal(bidder.userId);
                auction.bidderCharName.should.equal(bidder.name);
                bidder.gold.should.equal(bidderGoldPre);
                secondBidder.gold.should.equal(secondBidderGold);
                auction.bidAt.getTime().should.equal(bidAtPre.getTime());
            });

            it('Should place correct bid', async function() {
                const bidderGoldPre = bidder.gold;
                const bidAtPre = auction.bidAt;
                const errors = await placeBid(guildId, auction.id, secondBidder.userId, secondBidAmount);
                await bidder.reload();
                await auction.reload();
                await secondBidder.reload();
                errors.should.have.lengthOf(0);
                bidder.gold.should.be.above(bidderGoldPre).and.equal(bidderGold);
                auction.bidAt.should.be.above(bidAtPre);
                auction.bidderUserId.should.equal(secondBidder.userId);
                auction.bidderCharName.should.equal(secondBidder.name);
                auction.bidAmount.should.equal(secondBidAmount);
                auction.hasBid().should.be.true;
                secondBidder.gold.should.equal(secondBidderGold - secondBidAmount);
            });
        });

        afterEach(async function() {
            await GuildConfig.destroy({ where: {
                id: guildId
                
            } });
        });
    });
});