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
        // Parse arguments
        const parsedValues = RewardCommand.parseArguments(message.argsArray);
        if (!parsedValues.ok) {
            return message.reply(`Could not parse arguments. Refer to ${BotConfig.DM_REWARDS_WIKI_URL}`);
        }
        const transaction = await sequelize.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ });
        try {
            const characterPromises = parsedValues.userIdCharacterNameTuples.map(([ userId, charName ]) => {
                return Character.findOne({
                    where: {
                        userId: userId,
                        name: charName,
                        guildId: guildConfig.id
                    }, transaction: transaction
                });
            });
            const characters = await Promise.all(characterPromises);
            const [ dmReward ] = await DMReward.findOrCreate({
                where: {
                    userId: message.author.id,
                    guildId: guildConfig.id
                },
                transaction: transaction
            });
            for (let characterIndex = 0 ; characterIndex < characters.length; characterIndex++) {
                if (characters[characterIndex] == null) {
                    await transaction.rollback();
                    return message.reply(`Could not find character ${parsedValues.userIdCharacterNameTuples[characterIndex][1]} for user <@${parsedValues.userIdCharacterNameTuples[characterIndex[0]]}>`);
                }
            }
            const characterLevels = characters.map((character) => character.level);
            const charactersXp = characters.map((character) => character.experience);
            
            dmReward.calculate(guildConfig.rewardFormulas, characterLevels, charactersXp, 
                parsedValues.rewardedXp, parsedValues.rewardedGold, parsedValues.extraValue);
            
            // reward gold and exp
            const characterSavePromises = characters.map((character) => {
                character.earnXp(parsedValues.rewardedXp);
                character.earnGold(parsedValues.rewardedGold);
                return character.save({ transaction: transaction });
            });

            await Promise.all(characterSavePromises);
            // save DM reward
            await dmReward.save({ transaction: transaction });
            // confirmation
            const rewardedCharactersLines = characters.map((character) => `<@${character.userId}> ${character.name}`).join('\n');
            const prompt = `Please reply with yes to confirm rewarding ${parsedValues.rewardedGold} gold and ${parsedValues.rewardedXp} experience to:
${rewardedCharactersLines}`;
            const promptMessage = await message.reply(prompt);
            const filter = (reply) => reply.author.id == message.author.id;
            const collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT
            });
            if (collected.size == 0) {
                // time elapsed
                await promptMessage.edit('Confirmation timed out');
            } else if (collected.first().content.trim().toLowerCase() === 'yes') {
                await transaction.commit();
                // reply with dmReward representation
                return message.reply(`Your dm rewards:\n${dmReward.displayRewardsTable()}`);
            } else {
                message.reply('Canceled');
            }
            // timed out or did not match yes
            await transaction.rollback();
            
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

    /**
     * 
     * @param {string} token 
     * @returns {boolean} true if token is a switch
     */
    static parseArgumentsIsSwitchHelper(token) {
        return token.startsWith('--');
    }

    /**
     * 
     * @param {string} token 
     * @return {boolean} true if token looks like a user id.
     */
    static parseArgumentsIsUserIdHelper(token) {
        return token.startsWith('<');
    }

    /**
     * 
     * @param {string[]} input  tokenized input, split on whitespace
     * @returns {Object} representing parsed values. if ok property is false, error property should have a user helpful message. 
     */
    static parseArguments(input) {
        const parsedValues = {
            rewardedXp: NaN,
            rewardedGold: NaN,
            extraValue: 0,
            userIdCharacterNameTuples: [],
            ok: true
        };
        // PARSER STATES
        // START - Normal state
        // XP_VALUE - Parsed --xp last time
        // GOLD_VALUE - parsed --gold LAST TIME
        // EXTRA_VALUE_VALUE - parsed --extra-value LAST TIME
        // CHAR_NAME - parsed a user id and is now parsing char name
        // ERROR - Error state, throws
        // END - returns parsedValues prematurely
        const parserState = {
            state: 'START',
            accumulator: [],
            currentUserId: null,
            done: true
        };
        while (input.length > 0) {
            const currentToken = input.shift();
            switch (parserState.state) {
            case 'START':
                if (RewardCommand.parseArgumentsIsSwitchHelper(currentToken)) {
                    const lowerCaseToken = currentToken.toLowerCase();
                    if (lowerCaseToken === '--xp') {
                        parserState.state = 'XP_VALUE';
                    } else if (lowerCaseToken === '--gold') {
                        parserState.state = 'GOLD_VALUE';
                    } else if (lowerCaseToken === '--extra-value') {
                        parserState.state = 'EXTRA_VALUE_VALUE';
                    } else {
                        // unknown switch
                        parserState.state = 'END';
                        parsedValues.ok = false;
                        parsedValues.error = 'Unknown switch';
                        input.unshift(currentToken);
                    }
                    parserState.done = false;
                } else if (RewardCommand.parseArgumentsIsUserIdHelper(currentToken)) {
                    // Parse id and prepare accumulator.
                    parserState.currentUserId = BaseCommand.extractUserIDFromMentionContent(currentToken);
                    parserState.state = 'CHAR_NAME';
                    parserState.done = false;
                    parserState.accumulator = [];
                } else {
                    parserState.state = 'END';
                    parserState.ok = false;
                    parserState.error = 'Invalid usage.';
                }
                break;
            case 'CHAR_NAME':
                if (RewardCommand.parseArgumentsIsUserIdHelper(currentToken) || RewardCommand.parseArgumentsIsSwitchHelper(currentToken)) {
                    // END CHAR NAME
                    if (parserState.accumulator.length == 0) {
                        // did not find a char name.
                        parsedValues.ok = false;
                        parsedValues.error = 'Missing character name';
                        parserState.state = 'END';
                    } else {
                        parserState.done = true;
                        parsedValues.userIdCharacterNameTuples.push([ parserState.currentUserId,
                            parserState.accumulator.join(' ') ]);
                        parserState.state = 'START';
                    }
                    parserState.accumulator = [];
                    parserState.currentUserId = null;
                    input.unshift(currentToken);
                } else {
                    // is character name token
                    parserState.accumulator.push(currentToken);
                }
                break;
            case 'XP_VALUE': 
                parsedValues.rewardedXp = parseInt(currentToken, 10);
                parserState.state = 'START';
                parserState.done = true;
                break;
            case 'GOLD_VALUE':
                parsedValues.rewardedGold = parseFloat(currentToken);
                parserState.state = 'START';
                parserState.done = true;
                break;
            case 'EXTRA_VALUE_VALUE':
                parsedValues.extraValue = parseFloat(currentToken);
                parserState.state = 'START';
                parserState.done = true;
                break;
            case 'END':
                return parsedValues;
            default:
                throw new Error('RewardCommand parser entered unknown state');
            }
        }
        if (parserState.state === 'CHAR_NAME' && parserState.accumulator.length > 0) {
            // Parse last character name
            parsedValues.userIdCharacterNameTuples.push([ parserState.currentUserId,
                parserState.accumulator.join(' ') ]);
            parserState.done = true;
        }
        parsedValues.ok = parsedValues.ok & parserState.done;
        parsedValues.ok = !(isNaN(parsedValues.rewardedGold) || isNaN(parsedValues.rewardedXp) || isNaN(parsedValues.extraValue));
        parsedValues.userIdCharacterNameTuples = parsedValues.userIdCharacterNameTuples.map((tuple) => {
            return [ tuple[0], BaseCommand.removeLeadingAndTrailingQuoutes(tuple[1]) ];
        });
        return parsedValues;
    }
}

export { RewardCommand };