import { DateTime } from 'luxon';
/**
 * Displays a short line describing the auction, for use within lists and such.
 * @param {Auction} auction  
 * @param {string} seperator defaults to ' - '
 * @returns {string} 
 */
function displayAuctionShort(auction, seperator = ' - ') {
    const tokens = [ `#${auction.id}`, auction.title ];
    if (auction.bidAmount !== null) {
        tokens.push(`Current bid ${auction.bidAmount}`);
    } else {
        tokens.push('No bid yet.');
    }
    if (auction.isSold) {
        tokens.push(`Sold to <@${auction.bidderUserId}> ${auction.bidderCharName}`);
    } else if (auction.instaBuyAmount !== null) {
        tokens.push(`Max bid amount ${auction.instaBuyAmount}`);
    }
    const createdAtStr = DateTime.fromMillis(auction.createdAt).toFormat('ffff');
    tokens.push(`Opened at ${createdAtStr}`);
    return tokens.join(seperator);
}

export { displayAuctionShort };