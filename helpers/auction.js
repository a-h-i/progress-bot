import { Character, Auction, Sequelize, sequelize } from '../models/index.js';
import { formatJSDate } from './formatting.js';
import * as BotConfig from '../config/index.js';

/**
 * Displays a short line describing the auction, for use within lists and such.
 * @param {Auction} auction  
 * @param {string} [seperator] defaults to ' - '
 * @returns {string} 
 */
function displayAuctionShort(auction, seperator=' - ') {
    const tokens = [];
    if (auction.id !== undefined && auction.id !== null) {
        tokens.push(`#${auction.id}`);
    }
    tokens.push(auction.title);
    if (auction.isSold) {
        tokens.push(`Sold to <@${auction.bidderUserId}> ${auction.bidderCharName}`);
    } else if (auction.hasBid()) {
        tokens.push(`Current bid: ${auction.bidAmount} Gold`);
    } else if (auction.hasInstaBuy()) {
        tokens.push(`Max bid amount ${auction.instaBuyAmount} Gold`);
    } else {
        tokens.push(`Starting at ${auction.openingBidAmount} Gold`);
    }  
    return tokens.join(seperator);
}

/**
 * 
 * @param {Auction[]} auctions 
 * @param {string} [seperator] passed to Array.join defaults to new line
 * @returns {string} seperator seperated mapping by displayAuctionShort and it's default seperator. Sorted by created ASC
 */
function displayAuctionList(auctions, seperator='\n') {
    auctions.sort((left, right) => left.createdAt - right.createdAt).reverse();
    return auctions.map((a) => displayAuctionShort(a)).join(seperator);
}

/**
 * 
 * @param {Auction} auction 
 * @param {string} [seperator] defaults to newline
 */
function displayAuctionDetails(auction, seperator='\n') {
    const tokens = [];
    tokens.push('----');
    if (auction.id !== undefined && auction.id !== null) {
        tokens.push(`#${auction.id}`);
    }
    tokens.push(auction.title);
    tokens.push(`Minimum Increment: ${auction.minimumIncrement} Gold`);
    if (auction.hasBid()) {
        tokens.push(`Current bid: ${auction.bidAmount} Gold`);
        tokens.push(`Bid by <@${auction.bidderUserId}> ${auction.bidderCharName}`);
        tokens.push(`Bid made at ${formatJSDate(auction.bidAt)}`);
    } else if (auction.openingBidAmount > 0) {
        tokens.push(`No Bids. Starting at ${auction.openingBidAmount} Gold`);
    } else {
        tokens.push('No bids');
    }
    if (auction.isSold) {
        tokens.push(`Sold to <@${auction.bidderUserId}> ${auction.bidderCharName}`);
    } else if (auction.hasInstaBuy()) {
        tokens.push(`Max bid amount ${auction.instaBuyAmount} Gold`);
    }
    if (auction.createdAt) {
        const createdAtStr = formatJSDate(auction.createdAt);
        tokens.push(`Opened at ${createdAtStr}`);
    }
    tokens.push(`Opened by <@${auction.userId}> ${auction.charName}`);
    tokens.push('----');
    return tokens.join(seperator);
} 

/**
 * 
 * @param {string} auctionId 
 * @param {string} userId 
 * @param {Auction} auction 
 * @param {Character} character 
 * @param {number} amount 
 * @param {string[]} errors 
 */
function placeBidCheckErrors(auctionId, userId, auction, character, amount, errors) {
    if (auction == null) {
        errors.push(`No auction found with id #${auctionId}.`);
    }
    if (character == null) {
        errors.push(`User <@${userId}> does not have a currently active character.`);
    }
    if (auction == null || character == null) {
        return;
    }
    if (character.gold < amount) {
        errors.push(`Character ${character.name} does not have ${amount} gold.`);
    }
    if (!auction.canBidAmount(amount)) {
        if (auction.hasBid()) {
            errors.push(`Must bid at least ${auction.bidAmount + auction.minimumIncrement}`);
        } else {
            errors.push(`Auction starts at ${auction.openingBidAmount}`);
        }
    }
    if (auction.isSold) {
        errors.push(`Auction already closed and sold for ${auction.bidAmount} gold made at ${formatJSDate(auction.bidAt)}`);
    }
}
/**
 * Does nothing if auction has no bid
 * @param {Auction} auction 
 * @param {Sequelize.Transaction} transaction 
 * @returns {Promise}
 */
function releaseBidHold(auction, transaction) {
    if (auction.hasBid()) {
        return Character.increment({
            gold: auction.bidAmount
        }, {
            where: {
                guildId: auction.guildId,
                userId: auction.bidderUserId,
                name: auction.bidderCharName
            },
            transaction: transaction,
            returning: false
        });
    }
    return Promise.resolve(0);
}

/**
 * 
 * @param {string} guildId 
 * @param {string} auctionId 
 * @param {string} userId bidder user id
 * @param {number} amount gold amount
 * @param {Sequelize.Transaction} [transaction] Generally speaking should be of serializable isolation
 * @returns {Promise<string[]>} empty if no errors, otherwise user friendly logical errors.
 */
async function placeBidTransaction(guildId, auctionId, userId, amount, transaction=null) {
    const errors = [];
    
    if (transaction == null) {
        transaction = await sequelize.transaction({
            isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
        });
    }
    try {
        const auction = await Auction.findByPk(auctionId, guildId, { transaction: transaction,
            lock: transaction.LOCK.UPDATE });
        const activeChar = await Character.getActiveCharacter(userId, guildId, transaction,
            transaction.LOCK.UPDATE);
        placeBidCheckErrors(auctionId, userId, auction, activeChar, amount, errors);
        if (errors.length > 0) {
            await transaction.rollback();
            return errors;
        }

        const updatePromise = [ activeChar.increment({
            gold: amount * -1
        }, { transaction: transaction, 
            returning: false }),
        releaseBidHold(auction, transaction),
        auction.placeBid(amount, activeChar, transaction)
        ];

        await Promise.all(updatePromise);
    
        await transaction.commit();
        return errors;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

/**
 * 
 * @param {string} guildId 
 * @param {string} auctionId 
 * @param {string} userId bidder user id
 * @param {number} amount gold amount
 * @param {Sequelize.Transaction} [transaction] Generally speaking should be of serializable isolation
 * @returns {Promise<string[]>} empty if no errors, otherwise user friendly logical errors.
 */
async function placeBid(guildId, auctionId, userId, amount, transaction=null) {
    
    for (let retryCount = 0; retryCount < BotConfig.MAX_SERIALIZATION_TRANSACTION_RETY; retryCount++ ) {
        try {
            return await placeBidTransaction(guildId, auctionId, userId, amount, transaction);
        } catch (err) {
            if (err != null && err != undefined && err.code === 40001 ) {
                //serialization failure
                BotConfig.logger.debug(`Serialization error in placeBid ${JSON.stringify(err)}
with arguments ${JSON.stringify(arguments)}`);
                continue; // simply retry up to MAX_SERIALIZATION_TRANSACTION_RETRY
            } else {
                BotConfig.logger.error(`Non serialization falure in placeBid ${JSON.stringify(err)}
with arguments ${JSON.stringify(arguments)}`);
                throw err;
            }
        }
    }
    return [ `Concurrency error with bid. If this persists please report an issue ${BotConfig.ISSUES_URL}` ];
     
}

/**
 * 
 * @param {string} auctionId 
 * @param {string} guildId 
 * @param {string} userId 
 * @param {Sequelize.Transaction} transaction 
 * @return {Promise<string[] | Auction>} auction if no errors;
 */
async function deleteAuctionTransaction(auctionId, guildId, userId, transaction=null) {
    const errors = [];
    
    if (transaction == null) {
        transaction = await sequelize.transaction({
            isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
        });
    }
    try {
        const auction = await Auction.findByPk(auctionId, guildId, { transaction: transaction,
            lock: transaction.LOCK.UPDATE });
        if (auction == null || auction.userId != userId) {
            errors.push( `User <@${userId}> does not have an auction with id #${auctionId}` );
        }
        if (errors.length > 0) {
            await transaction.rollback();
            return errors;
        }
        await releaseBidHold(auction, transaction);
        await auction.destroy({
            transaction: transaction
        });
        await transaction.commit();
        return auction;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }

}

/**
 * 
 * @param {string} auctionId 
 * @param {string} guildId 
 * @param {string} userId auction owner
 * @param {Sequelize.Transaction} transaction 
 * @return {Promise<string[] | Auction>} auction if no errors;
 * 
 */
async function deleteAuction(auctionId, guildId, userId, transaction=null) {

    for (let retryCount = 0; retryCount < BotConfig.MAX_SERIALIZATION_TRANSACTION_RETY; retryCount++) {
        try {
            return await deleteAuctionTransaction(auctionId, guildId, userId, transaction);
        }  catch (err) {
            if (err != null && err != undefined && err.code === 40001 ) {
                //serialization failure
                BotConfig.logger.debug(`Serialization error in deleteAuction ${JSON.stringify(err)}
with arguments ${JSON.stringify(arguments)}`);
                continue; // simply retry up to MAX_SERIALIZATION_TRANSACTION_RETRY
            } else {
                BotConfig.logger.error(`Non serialization falure in deleteAuction ${JSON.stringify(err)}
with arguments ${JSON.stringify(arguments)}`);
                throw err;
            }
        }
    }
    return [ `Concurrency error with deletion. If this persists please report an issue ${BotConfig.ISSUES_URL}` ]; 
}

export { displayAuctionShort, displayAuctionDetails, displayAuctionList, placeBid, releaseBidHold, deleteAuction };