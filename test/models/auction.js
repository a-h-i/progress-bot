import { Auction, Character, GuildConfig } from '../../models/index.js';
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
});