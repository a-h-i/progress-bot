import { Auction, Character, GuildConfig } from '../../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import { ClientMock, GuildMock, MessageMock, UserMock } from '../mocks/index.js';
import { deleteAuction, placeBid } from '../../helpers/index.js';

describe('AuctionCommand', function() {
    let clientMock, guildMock, guildConfig;
    const guildId = uuidv4();
    const characters = [];
    const users = [];
    before(async function() {
        clientMock = new ClientMock();
        guildMock = new GuildMock(guildId);
        clientMock.addGuild(guildMock);
        [ guildConfig ] = await GuildConfig.findOrCreate({
            where: {
                id: guildId
            }
        });
        for (let i = 0; i < 3; i++) {
            const user = new UserMock(uuidv4(), guildMock, {
                displayName: `User#${i}`
            });
            guildMock.members.create(user);
            users.push(user);
        }
    });

    beforeEach(async function() {
        characters.length = 0;
        for (const user of users) {
            characters.push(await Character.registerNewCharacter(guildConfig.id, user.id, 'Char', Character.getXpFromLevel(guildConfig.startingLevel), 
                100000));
        }
    });


    describe('$auction create', function() {

    });

    describe('$auction bid', function() {
        let owner, bidder, auction;
        beforeEach(async function() {
            owner = characters[0];
            bidder = characters[1];
            auction = await Auction.create({
                guildId: guildConfig.id,
                userId: owner.userId,
                charName: owner.name,
                title: 'Test Auction',
                openingBidAmount: 1000,
                minimumIncrement: 100
            });
        });

        it('Should handle unknown auction id', async function() {
            const scenario = clientMock.createScenario(guildMock);
            const message = new MessageMock(clientMock, scenario, guildMock.members.cache.get(bidder.userId), [ '$auction bid', `#${~auction.id}`, auction.openingBidAmount ]);
            scenario.queueMessage(message);
            auction.hasBid().should.be.false;
            const bidderGold = bidder.gold;
            await scenario.run();
            scenario.hasReplies().should.be.true;
            await auction.reload();
            auction.hasBid().should.be.false;
            await bidder.reload();
            bidder.gold.should.equal(bidderGold);
            const content = scenario.popReply().content;
            content.should.not.contain('undefined');
            content.should.not.contain('null');
            content.should.match(/no auction found/i);
            content.should.contain(~auction.id);
        });

        it('Should handle bid amount less than opening bid', async function() {
            const scenario = clientMock.createScenario(guildMock);
            const message = new MessageMock(clientMock, scenario, guildMock.members.cache.get(bidder.userId), [ '$auction bid',
                `#${auction.id}`, auction.openingBidAmount - 5 ]);
            scenario.queueMessage(message);
            auction.hasBid().should.be.false;
            const bidderGold = bidder.gold;
            await scenario.run();
            scenario.hasReplies().should.be.true;
            await auction.reload();
            auction.hasBid().should.be.false;
            await bidder.reload();
            bidder.gold.should.equal(bidderGold);
            const content = scenario.popReply().content;
            content.should.not.contain('undefined');
            content.should.not.contain('null');
            content.should.contain(auction.openingBidAmount);
            content.should.match(/starts at/i);
        });
        
        it('Should place bid on empty auction', async function() {
            const scenario = clientMock.createScenario(guildMock);
            const bidAmount = auction.openingBidAmount;
            const message = new MessageMock(clientMock, scenario, guildMock.members.cache.get(bidder.userId), [ '$auction bid',
                `#${auction.id}`, bidAmount ]);
            scenario.queueMessage(message);
            auction.hasBid().should.be.false;
            const bidderGold = bidder.gold;
            await scenario.run();
            scenario.hasReplies().should.be.true;
            await auction.reload();
            auction.hasBid().should.be.true;
            await bidder.reload();
            bidder.gold.should.equal(bidderGold - bidAmount);
            const content = scenario.popReply().content;
            content.should.not.contain('undefined');
            content.should.not.contain('null');
            content.should.contain(bidAmount);
            content.should.match(/success/i);
        });
        

        it('Should place bid on auction with bid', async function() {
            const firstBidder = characters[2];
            const firstBidAmount = auction.openingBidAmount;
            const firstBidderPreBidGold = firstBidder.gold;
            await placeBid(guildConfig.id, auction.id, firstBidder.userId, firstBidAmount);
            await firstBidder.reload();
            await auction.reload();
            firstBidderPreBidGold.should.not.equal(firstBidder.gold);
            auction.hasBid().should.be.true;
            auction.bidderUserId.should.equal(firstBidder.userId);
            auction.bidderCharName.should.equal(firstBidder.name);


            const scenario = clientMock.createScenario(guildMock);
            const bidAmount = firstBidAmount + auction.minimumIncrement;
            const bidderPreBidGold = bidder.gold;
            const message = new MessageMock(clientMock, scenario, guildMock.members.cache.get(bidder.userId), [ '$auction bid',
                `#${auction.id}`, bidAmount ]);
            scenario.queueMessage(message);

            await scenario.run();
            await auction.reload();
            await bidder.reload();
            await firstBidder.reload();

            auction.hasBid().should.be.true;
            auction.bidderUserId.should.equal(bidder.userId);
            auction.bidderCharName.should.equal(bidder.name);

            firstBidder.gold.should.equal(firstBidderPreBidGold);
            bidder.gold.should.equal(bidderPreBidGold - bidAmount);

            scenario.hasReplies().should.be.true;
            const content = scenario.popReply().content;
            content.should.not.contain('undefined');
            content.should.not.contain('null');
            content.should.contain(bidAmount);
            content.should.match(/success/i);
            

        });

        it('Should handle bid less than minimum increment', async function() {
            const firstBidder = characters[2];
            const firstBidAmount = auction.openingBidAmount;
            const firstBidderPreBidGold = firstBidder.gold;
            await placeBid(guildConfig.id, auction.id, firstBidder.userId, firstBidAmount);
            await firstBidder.reload();
            await auction.reload();
            firstBidderPreBidGold.should.not.equal(firstBidder.gold);
            auction.hasBid().should.be.true;
            auction.bidderUserId.should.equal(firstBidder.userId);
            auction.bidderCharName.should.equal(firstBidder.name);


            const scenario = clientMock.createScenario(guildMock);
            const bidAmount = firstBidAmount + auction.minimumIncrement - .1;
            const bidderPreBidGold = bidder.gold;
            const message = new MessageMock(clientMock, scenario, guildMock.members.cache.get(bidder.userId), [ '$auction bid',
                `#${auction.id}`, bidAmount ]);
            scenario.queueMessage(message);

            await scenario.run();
            await auction.reload();
            await bidder.reload();
            await firstBidder.reload();

            auction.hasBid().should.be.true;
            auction.hasBid().should.be.true;
            auction.bidderUserId.should.equal(firstBidder.userId);
            auction.bidderCharName.should.equal(firstBidder.name);
            firstBidder.gold.should.equal(firstBidderPreBidGold - auction.openingBidAmount);
            bidder.gold.should.equal(bidderPreBidGold);
            const content = scenario.popReply().content;
            content.should.not.contain('undefined');
            content.should.not.contain('null');
            content.should.contain(firstBidAmount + auction.minimumIncrement);
            content.should.match(/at least/i);

        });
        it('Should handle bid less than current bid', async function() {
            const firstBidder = characters[2];
            const firstBidAmount = auction.openingBidAmount + auction.minimumIncrement * 2;
            const firstBidderPreBidGold = firstBidder.gold;
            await placeBid(guildConfig.id, auction.id, firstBidder.userId, firstBidAmount);
            await firstBidder.reload();
            await auction.reload();
            firstBidderPreBidGold.should.not.equal(firstBidder.gold);
            auction.hasBid().should.be.true;
            auction.bidderUserId.should.equal(firstBidder.userId);
            auction.bidderCharName.should.equal(firstBidder.name);


            const scenario = clientMock.createScenario(guildMock);
            const bidAmount = firstBidAmount - .1;
            const bidderPreBidGold = bidder.gold;
            const message = new MessageMock(clientMock, scenario, guildMock.members.cache.get(bidder.userId), [ '$auction bid',
                `#${auction.id}`, bidAmount ]);
            scenario.queueMessage(message);

            await scenario.run();
            await auction.reload();
            await bidder.reload();
            await firstBidder.reload();

            auction.hasBid().should.be.true;
            auction.hasBid().should.be.true;
            auction.bidderUserId.should.equal(firstBidder.userId);
            auction.bidderCharName.should.equal(firstBidder.name);
            bidder.gold.should.equal(bidderPreBidGold);
            const content = scenario.popReply().content;
            content.should.not.contain('undefined');
            content.should.not.contain('null');
            content.should.contain(firstBidAmount + auction.minimumIncrement);
            content.should.match(/at least/i);
        });

        it('Does not allow bidding on own auction', async function() {
            const bidder = owner;
            const bidAmount = auction.openingBidAmount;
            const scenario = clientMock.createScenario(guildMock);
            const message = new MessageMock(clientMock, scenario, guildMock.members.cache.get(bidder.userId), [ '$auction bid',
                `#${auction.id}`, bidAmount ]);
            scenario.queueMessage(message);
            auction.hasBid().should.be.false;
            const bidderGold = bidder.gold;
            await scenario.run();
            scenario.hasReplies().should.be.true;
            await auction.reload();
            auction.hasBid().should.be.false;
            await bidder.reload();
            bidder.gold.should.equal(bidderGold);
            const content = scenario.popReply().content;
            content.should.not.contain('undefined');
            content.should.not.contain('null');
            content.should.contain(bidder.name);
            content.should.match(/can not bid on own auction/i);
        });

        afterEach(async function() {
            await deleteAuction(auction.id, guildConfig.id, auction.userId);
        });
    });

    describe('$auction manage delete', function() {
        let owner, auction, other, bidder;
        let preBidGold;
        beforeEach(async function() {
            owner = characters[0];
            bidder = characters[1];
            other = characters[2];
            auction = await Auction.create({
                guildId: guildConfig.id,
                userId: owner.userId,
                charName: owner.name,
                title: 'Test Auction',
                openingBidAmount: 1000,
                minimumIncrement: 100
            });
            preBidGold = bidder.gold;
            await placeBid(guildConfig.id, auction.id, bidder.userId, auction.openingBidAmount);
            await bidder.reload();
            await auction.reload();
        });

        it('Should delete auction and refund bid amount', async function() {
            const scenario = clientMock.createScenario(guildMock);
            const message = new MessageMock(clientMock, scenario, guildMock.members.cache.get(owner.userId), [ '$auction manage delete',
                `#${auction.id}` ]);
            scenario.queueMessage(message);
            bidder.gold.should.not.equal(preBidGold);
            await scenario.run();
            await bidder.reload();
            const count = await Auction.count({ where: { id: auction.id } });
            count.should.equal(0);
            bidder.gold.should.equal(preBidGold);
            const content = scenario.popReply().content;
            content.should.not.contain('undefined');
            content.should.not.contain('null');
            content.should.match(/deleted/i);
        });

        it('Should not allow deletion by non owner', async function() {
            const scenario = clientMock.createScenario(guildMock);
            const message = new MessageMock(clientMock, scenario, guildMock.members.cache.get(other.userId), [ '$auction manage delete',
                `#${auction.id}` ]);
            scenario.queueMessage(message);
            await scenario.run();
            const count = await Auction.count({ where: { id: auction.id } });
            count.should.equal(1);
            const content = scenario.popReply().content;
            content.should.not.contain('undefined');
            content.should.not.contain('null');
            content.should.match(/does not have an auction with id/i);
            content.should.contain(`<@${other.userId}>`);
            content.should.contain(auction.id);
        });

        it('Should handle unknown id', async function() {
            const scenario = clientMock.createScenario(guildMock);
            const message = new MessageMock(clientMock, scenario, guildMock.members.cache.get(owner.userId), [ '$auction manage delete',
                `#${~auction.id}` ]);
            scenario.queueMessage(message);
            await scenario.run();
            const count = await Auction.count({ where: { id: auction.id } });
            count.should.equal(1);
            const content = scenario.popReply().content;
            content.should.not.contain('undefined');
            content.should.not.contain('null');
            content.should.match(/does not have an auction with id/i);
            content.should.contain(`<@${owner.userId}>`);
            content.should.contain(~auction.id);
        });

        afterEach(async function() {
            await deleteAuction(auction.id, guildConfig.id, auction.userId);
        });
    });


    afterEach(async function() {
        await Promise.all(characters.map((c) => c.destroy()));
        await Auction.destroy({ where: {
            userId: users.map((u) => u.id)
        } });
    });

    after(async function() {
        await guildConfig.destroy();
    });
});