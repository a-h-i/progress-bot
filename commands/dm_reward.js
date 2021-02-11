import { BaseCommand } from './base_command.js';
import { DMReward, Character, sequelize, Sequelize } from '../models/index.js';
import { logger } from '../config/index.js';
import { listRewards } from '../helpers/index.js';
import { serializeError } from 'serialize-error';

const description = `Consume dm rewards.
Usage: dmreward poolName amount(xp|gold) Your Character Name To be Rewarded
Example:
    dmreward xp 400xp Ibnis Talba
    Attempts to reward 400 xp from the xp reward pool to your own character named Ibnis Talba
    Use dmreward without arguments to list your available DM rewards.
    Note you can not use fractions for XP reward
`;

class DMRewardCommand extends BaseCommand {
    constructor() {
        super([ 'dmreward' ], description, []);
    }

    async execute(message, guildConfig) {
        if (!this.hasPermission(message.member, guildConfig.getRewardRolesAsMap())) {
            return this.standardNotAllowedMessage(message);
        }
        const transaction = await sequelize.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        let commit = false;
        try {
            const dmReward = await DMReward.findOne({
                where: {
                    guildId: guildConfig.id,
                    userId: message.author.id
                },
                transaction: transaction
            });
            if (dmReward == null) {
                commit = false;
                return this.noRewardsReplyHelper(message);
            }
            if (message.argsArray.length == 0) {
            // list
                commit = true;
                return message.reply(listRewards(message.member, guildConfig, dmReward));
            }

            if (message.argsArray.length == 1 && message.mentions.users.size == 1) {
                const dm = message.mentions.users.first();
                const otherReward = await DMReward.findOne({
                    where: {
                        guildId: guildConfig.id,
                        userId: dm
                    }, transaction: transaction
                });
                if (otherReward == null) {
                    commit = false;
                    return this.noRewardsReplyHelper(message);
                }
                commit = true;
                return message.reply(listRewards(message.guild.members.cache.get(dm), guildConfig, otherReward));
            }

            if (message.argsArray.length <= 2) {
                commit = false;
                return message.reply(this.createHelpEmbed());
            }
            const poolName = message.argsArray.shift();
            const amountStr = message.argsArray.shift();
            const charName = message.argsArray.join(' ');
            if (!guildConfig.hasRewardPool(poolName)) {
                let poolStr = guildConfig.rewardPoolsToString();
                if (poolStr.length == 0) {
                    poolStr = 'None.';
                }
                commit = false;
                return message.reply(`Pool with name ${poolName} does not exist
Available Pools:
${poolStr}`);
            }
            const poolVars = guildConfig.getRewardPoolVars(poolName);
            const [ amount, type ] = DMRewardCommand.parseAmountStr(amountStr);
            if (type == null || isNaN(amount)) {
                commit = false;
                return message.reply(this.createHelpEmbed());
            }
            const covered = dmReward.consume(amount, poolVars);
            if (!covered) {
                commit = false;
                return message.reply(`You do not have enough rewards\n${listRewards(message.member, guildConfig, dmReward)}`);
            }
            await dmReward.save({ transaction: transaction });
            const character = await Character.findOne({
                where: {
                    userId: message.author.id,
                    guildId: guildConfig.id,
                    name: charName
                }, 
                transaction: transaction
            });
            if (character == null) {
                commit = false;
                return message.reply(`You do not have a character named ${charName}`);
            }
            if (type == 'xp') {
                character.earnXp(amount);
            } else if (type == 'gold') {
                character.earnGold(amount);
            } else {
                commit = false;
                return message.reply(`Unknown type ${type}. Must be either gold or xp`);
            }
            await character.save({ transaction: transaction });
            commit = true;
            return message.reply(`Remaining\n${listRewards(message.member, guildConfig, dmReward)}`);
        } catch (err) {
            logger.error('Error while processing DMRewardCommand');
            logger.error(serializeError(err));
            throw err;
        } finally {
            if (commit) {
                await transaction.commit();
            } else {
                await transaction.rollback();
            }
        }

        
    }

    noRewardsReplyHelper(message) {
        return message.reply('No DM rewards yet.');
    }

   
    /**
     * 
     * @param {string} amountStr  inform of <number>(xp|gold)
     * @returns {[number, string]} string is one of xp or gold or null if failed. Number is always positive
     */
    static parseAmountStr(amountStr) {
        const xpRegex = /xp/ig;
        const goldRegex = /gold/ig;
        if (xpRegex.test(amountStr)) {
            const amount = parseFloat(amountStr.replaceAll(xpRegex, ''));
            if (!Number.isSafeInteger(amount)) {
                return [ Math.abs(amount), null ];
            }
            return [ Math.abs(amount), 'xp' ];
        } else if (goldRegex.test(amountStr)) {
            const amount = parseFloat(amountStr.replaceAll(goldRegex, ''));
            return [ Math.abs(amount), 'gold' ];
        }
        
        return [ 0, null ]; // failure
        
    }
}

export { DMRewardCommand };