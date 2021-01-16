import { DateTime } from 'luxon';
/**
 * Displays a short line describing the auction, for use within lists and such.
 * @param {Auction} auction  
 * @param {string} [seperator] defaults to ' - '
 * @returns {string} 
 */
function displayAuctionShort(auction, seperator='\n') {
    const tokens = [];
    tokens.push('----');
    if (auction.id !== undefined && auction.id !== null) {
        tokens.push(`#${auction.id}`);
    }
    tokens.push(auction.title);
    tokens.push(`Minimum Increment ${auction.minimumIncrement} Gold`);
    if (auction.hasBid()) {
        tokens.push(`Current bid: ${auction.bidAmount} Gold`);
    } else if (auction.openingBidAmount > 0) {
        tokens.push(`No Bids. Starting at ${auction.openingBidAmount} Gold`);
    } else {
        tokens.push('No bids');
    }
    if (auction.isSold) {
        tokens.push(`Sold to <@${auction.bidderUserId}> ${auction.bidderCharName}`);
    } else if (auction.instaBuyAmount !== null && auction.instaBuyAmount !== undefined) {
        tokens.push(`Max bid amount ${auction.instaBuyAmount} Gold`);
    }
    if (auction.createdAt) {
        const createdAtStr = DateTime.fromJSDate(auction.createdAt).toFormat('ffff');
        tokens.push(`Opened at ${createdAtStr}`);
    }
    tokens.push('----');
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

export { displayAuctionShort, displayAuctionList };