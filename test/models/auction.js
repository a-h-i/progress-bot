import { Auction } from '../../models/index.js';

describe('Auction', function() {
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