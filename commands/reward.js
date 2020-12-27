import { BaseCommand } from './base_command.js';
import { Character, DMReward, sequelize, Sequelize } from '../models/index.js';
import * as BotConfig from '../config/index.js';

const description = `Reward a user or display your dm rewards or someone elses
To reward players use:
reward @Player1 Player 1 Char Name @Player2 Player 2 char name --xp 400 --gold 500 --extra-value 1
To list your rewards use just reward with no extra arguments
to list the rewards of another person use:
reward @OtherPerson
Note you can only list the rewards of one person at a time`;

/**
 * 
 */
class RewardCommand extends BaseCommand {
    constructor() {
        super('reward', description, []);
        
    }

    async execute(message, guildConfig) {
        if (!this.hasPermission(message.member, guildConfig.getRewardRolesAsMap())) {
            return this.standardNotAllowedMessage(message);
        }

        if (message.argsArray.length == 0) {
            // List DM rewards
            return this.listRewardsHelper(message, message.member, guildConfig);
        } else if (message.argsArray.length == 1 && message.mentions.users.size == 1) {
            return this.listRewardsHelper(message, message.guild.members.cache.get(message.mentions.users.first().id), guildConfig);
        }

        const userIdCharacterNameTuples = [];
        let rewardedXp = NaN;
        let rewardedGold = NaN;
        let extraValue = 0;
        let otherFail = false;
        while (message.argsArray.length >= 2) {
            const firstArg = message.argsArray.shift();
            const secondArg = message.argsArray.shift();

            if (firstArg === '--xp') {
                rewardedXp = parseInt(secondArg, 10);
            } else if (firstArg === '--gold') {
                rewardedGold = parseFloat(secondArg);
            } else if (firstArg === '--extra-value') {
                extraValue = parseFloat(secondArg);
            } else {
                // possible user id mention and character name
                const userId = BaseCommand.extractUserIDFromMentionContent(firstArg);
                if (userId !== null) {
                    userIdCharacterNameTuples.push([ userId, secondArg ]);
                } else {
                    otherFail = true;
                    break;
                }
            } 
        } 

        if (otherFail || [ rewardedXp, rewardedGold, extraValue ].some(isNaN)) {
            return message.reply(`Could not parse arguments. Refer to ${BotConfig.DM_REWARDS_WIKI_URL}`);
        }
        const transaction = await sequelize.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED });
        try {
            const characterPromises = userIdCharacterNameTuples.map(([ userId, charName ]) => {
                return Character.findOne({
                    where: {
                        userId: userId,
                        name: charName
                    }, transaction: transaction
                });
            });
            const characters = await Promise.all(characterPromises);
            const dmReward = await DMReward.findOrCreate({
                where: {
                    userId: message.author.id,
                    guildId: guildConfig.id
                },
                transaction: transaction
            });
            for (let characterIndex = 0 ; characterIndex < characters.length; characterIndex++) {
                if (characters[characterIndex] == null) {
                    await transaction.rollback();
                    return message.reply(`Could not find character ${userIdCharacterNameTuples[characterIndex][1]} for user <@${userIdCharacterNameTuples[characterIndex[0]]}>`);
                }
            }
            const characterLevels = characters.map((character) => character.level);
            const charactersXp = characters.map((character) => character.experience);
            
            dmReward.calculate(guildConfig.rewardFormulas, characterLevels, charactersXp, 
                rewardedXp, rewardedGold, extraValue);
            
            // reward characters
            const characterOrCondition = characters.map((character) => {
                return {
                    guildId: guildConfig.id,
                    userId: character.userId,
                    name: character.name
                };
            });
            await Character.increment({
                gold: rewardedGold,
                experience: rewardedXp
            }, {
                where: {
                    guildId: guildConfig.id,
                    [Sequelize.Op.or]: characterOrCondition
                }, 
                transaction: transaction
            });
                
            // save DM reward
            await dmReward.save({ transaction: transaction });
            
            await transaction.commit();
            // reply with dmReward representation
            return message.reply(dmReward.displayRewardsTable());
        } catch (err) {
            await transaction.rollback();
            BotConfig.logger.error('Error processing reward command');
            BotConfig.logger.error(err);
            throw err;
        }
       


    }

    async listRewardsHelper(message, member, guildConfig) {
        const dmReward = await DMReward.findOne({
            where: {
                guildId: guildConfig.id,
                userId: member.id
            }
        });
        if (dmReward == null) {
            return message.reply(`No rewards yet for ${member.displayName}`);
        } else {
            return message.reply(`${member.displayName} Rewards\n${dmReward.displayRewardsTable()}`);
        }
    }
}

export { RewardCommand };