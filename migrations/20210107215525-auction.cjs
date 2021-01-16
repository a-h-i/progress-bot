'use strict';


async function up(queryInterface) {

    const sql = `CREATE TABLE auctions (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        bid_at TIMESTAMP WITH TIME ZONE,
        bid_amount double precision,
        opening_bid_amount double precision NOT NULL DEFAULT 1,
        insta_buy_amount double precision,
        minimum_increment double precision NOT NULL DEFAULT 1,
        is_sold BOOLEAN NOT NULL DEFAULT FALSE,
        is_canceled BOOLEAN NOT NULL DEFAULT FALSE,
        guild_id varchar(64) NOT NULL REFERENCES guild_configs(id) ON UPDATE CASCADE ON DELETE CASCADE,
        user_id varchar(64) NOT NULL,
        bidder_user_id varchar(64),
        bidder_char_name varchar(256),
        character_name varchar(256) NOT NULL,
        title text NOT NULL,
        description text
    )`;
    
    await queryInterface.sequelize.query(sql);
}


async function down(queryInterface) {
    const sql = 'DROP TABLE auctions';
    await queryInterface.sequelize.query(sql);
}


module.exports = { up, down };