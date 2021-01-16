import { BaseCommand } from './base_command.js';
import { Auction, Character } from '../models/index.js';
import { displayAuctionList, authorIdFilterFactory, displayAuctionShort } from '../helpers/index.js';
import * as BotConfig from '../config/index.js';

const description = `Manage and bid on auction.
`;
class AuctionCommand extends BaseCommand {
    constructor() {
        const args = [
            {
                name: 'list',
                title: 'list',
                description: 'Lists currently active auctions, guild wide',
                handler: AuctionCommand.prototype.handleListAuctions
            },
            {
                name: 'create',
                title: 'create',
                description: 'Starts interactive auction creation mode',
                handler: AuctionCommand.prototype.handleCreateAuction
            },
            {
                name: 'manage',
                title: 'manage',
                description: 'View and manage your auctions',
                handler: AuctionCommand.prototype.handleManageAuctions
            }
        ];
        args.forEach((arg) => {
            if (!arg.hasOwnProperty('handler')) {
                arg.handler = (message) => message.reply('Feature not yet implemented.');
            }
        });
        super('auction', description, args);
    }

    async execute(message, guildConfig) {
        if (message.argsArray.length == 0) {
            return message.reply(this.createHelpEmbed());
        }
        const subCommand = message.argsArray.shift().toLowerCase();
        for (const arg of this.commandArguments) {
            if (arg.name === subCommand) {
                return await Promise.resolve(arg.handler.call(this, message, guildConfig));
            }
        }
        // unknown sub command
        return message.reply(this.createHelpEmbed());
    }

    async handleManageAuctions(message, guildConfig) {
        if (message.argsArray.length == 0) {
            const auctions = await Auction.findUserAuctions(guildConfig.id, message.author.id);
            const replyStr = auctions.length > 0 ? '\n' + displayAuctionList(auctions) : "You don't have any active auctions";
            return message.reply(replyStr, {
                allowedMentions: { users: [], roles: [] }
            });
        }
    }

    async handleListAuctions(message, guildConfig) {
        const auctions = await Auction.findActiveAuctions(guildConfig.id);
        const displayList = auctions.length > 0 ? '\n' + displayAuctionList(auctions) : 'No currently active auctions';
        return message.reply(displayList, {
            allowedMentions: { users: [], roles: [] }
        });
    }

    async handleCreateAuction(message, guildConfig) {
        const activeChar = await Character.getActiveCharacter(message.author.id, guildConfig.id);
        if (activeChar == null) {
            return message.reply('You do not currently have an active character.');
        }
        const auction = Auction.build(
            {
                guildId: guildConfig.id,
                userId: message.author.id,
                charName: activeChar.name
            }
        );

        const steps = [
            {
                name: 'Title',
                handler: this.interactiveCreateTitle
            },
            {
                name: 'Starting amount',
                handler: this.interactiveCreateOpeningBid
            },
            {
                name: 'Minimum Bid increase',
                handler: this.interactiveCreateMinimumIncrement
            }
        ];
        let success = true;
        for (let i = 0; i < steps.length && success; i++) {
            success = await Promise.resolve(steps[i].handler.call(this, message, auction, guildConfig));
        }
        if (!success) {
            return message.reply('Canceled.');
        } else {
            return this.auctionInteractiveConfirmSave(message, auction, steps, guildConfig);
        }

    }

    /**
     * 
     * @param {Message} message 
     * @param {Auction} auction 
     * @param {Object[]} steps 
     * @param {GuildConfig} guildConfig
     */
    async auctionInteractiveConfirmSave(message, auction, steps, guildConfig) {
        const yesRegex = /^y(?:e?|(?:es)?)$/;
        const noRegex = /^no?$/;
        const filter = authorIdFilterFactory(message.author.id);
        let retryCount = 0;
        while (retryCount < BotConfig.MAX_INTERACTIVE_RETRY_COUNT) {
            const prompt = `\n${displayAuctionShort(auction)}
Operations:
${steps.map((step, index) => `${index + 1} - ${step.name}`).join('\n')}
----------
Reply with yes to confirm, no to cancel the operation or an operation number to change a value`;
            const promptMessage = await message.reply(prompt);
            const collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT
            });
            if (collected.size == 0) {
            // timed out
                await promptMessage.edit(promptMessage.content + '\nResponse Timed out.');
                retryCount++;
            }
            const content = collected.first().content.trim();
            const contentLowerCase = content.toLowerCase();
            if (yesRegex.test(contentLowerCase)) {
                await auction.save();
                return message.reply(`Created:\n
${displayAuctionShort(auction)}`, {
                    allowedMentions: {
                        users: [],
                        roles: []
                    }
                });
            } else if (noRegex.test(contentLowerCase)) {
                return message.reply('Operation canceled');
            } else {
                const operationIndex = parseInt(content);
                if (isNaN(operationIndex) || operationIndex < 1 || operationIndex > steps.length) {
                    await message.reply('Invalid input');
                    retryCount++;
                } else {
                    await Promise.resolve(steps[operationIndex - 1].handler.call(this, message, auction, guildConfig));
                }
            }
        }
        return message.reply('Operation Canceled.');

        
    }

    /**
     * 
     * @param {Message} message 
     * @param {Auction} auction 
     */
    async interactiveCreateTitle(message, auction) {
        const prompt = `Please enter a title for the auction, a good bet would be the name of the item you are selling.
${Auction.TITLE_REQUIREMENTS.join('\n')}
Reply with c to cancel ${auction.title? 'or s to skip.' : '.'}`;
        const filter = authorIdFilterFactory(message.author.id);
        for (let retryCount = 0; retryCount < BotConfig.MAX_INTERACTIVE_RETRY_COUNT; retryCount++) {
            const promptMessage = await message.reply(prompt);
            let collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT,
            });
            if (collected.size == 0) {
                // empty
                return promptMessage.edit(promptMessage.content + '\nResponse timed out.').then(() => false);
            }
            const content = collected.first().content.trim();
            const contentLowerCase = content.toLowerCase();
            if (contentLowerCase === 'c') {
                // canceled
                return false;
            } else if (contentLowerCase === 's') {
                // can not skip if unset
                if (auction.title) {
                    return true;
                } else {
                    const repeatPrompt = 'This value is requrired and cannot be skipped';
                    await collected.first().reply(repeatPrompt);
                }
            } else {
                const errors = Auction.isValidTitle(content);
                if (errors.length == 0) {
                    auction.title = content;
                    return true;
                } else {
                    await collected.first().reply(errors.join('\n'));
                }
            }
        }
        return false;
    }

    async interactiveCreateOpeningBid(message, auction) {
        const prompt = `Please enter an opening bid amount. skip to leave at ${auction.openingBidAmount} Gold
Reply with c to cancel or s to skip`;
        const filter = authorIdFilterFactory(message.author.id);
        while (true) {
            const promptMessage = await message.reply(prompt);
            let collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT
            });
            if (collected.size == 0) {
                // timed out
                return promptMessage.edit(promptMessage.content + '\nResponse timed out.').then(() => false);
            }
            const content = collected.first().content.trim();
            const contentLowerCase = content.toLowerCase();
            if (contentLowerCase === 's') {
                // skip
                return true;
            } else if (contentLowerCase === 'c') {
                return false;
            } else {
                const errors = Auction.isValidOpeningBidAmount(content);
                if (errors.length == 0) {
                    auction.openingBidAmount = Auction.parseOpeningBidAmountStr(content);
                    return true;
                } else {
                    await collected.first().reply(errors.join('\n'));
                }
            }
        }
    }

    async interactiveCreateMinimumIncrement(message, auction) {
        const prompt = `Please enter a minimum bid amount. skip to leave at ${auction.minimumIncrement} Gold
Reply with c to cancel or s to skip`;
        const filter = authorIdFilterFactory(message.author.id);
        while (true) {
            const promptMessage = await message.reply(prompt);
            let collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT
            });
            if (collected.size == 0) {
                return promptMessage.edit(promptMessage.content + '\nResponse timed out.').then(() => false);
            }
            const content = collected.first().content.trim();
            const contentLowerCase = content.toLowerCase();
            if (contentLowerCase === 's') {
                //skip   
                return true;
            } else if (contentLowerCase === 'c') {
                return false;
            } else {
                const errors = Auction.isValidMinimumIncrement(content);
                if (errors.length == 0) {
                    auction.minimumIncrement = Auction.parseMinimumIncrement(content);
                    return true;
                } else {
                    await collected.first().reply(errors.join('\n'));
                }
            }
        }
    }
}

export { AuctionCommand };