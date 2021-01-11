import { BaseCommand } from './base_command.js';
import { Auction, Character } from '../models/index.js';
import { displayAuctionShort } from '../helpers/index.js';

const description = `Manage and bid on auction.
`;
class AuctionCommand extends BaseCommand {
    constructor() {
        const args = [
            {
                name: 'list',
                description: 'Lists currently active auctions, guild wide',
                handler: AuctionCommand.prototype.handleListAuctions
            },
            {
                name: 'create',
                description: 'Starts interactive auction creation mode',
                handler: AuctionCommand.prototype.handleCreateAuction
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

    async handleListAuctions(message, guildConfig) {
        const auctions = await Auction.findActiveAuctions(guildConfig.id);
        auctions.sort((left, right) => left.createdAt - right.createdAt).reverse();
        const displayList = auctions.map(displayAuctionShort).join('\n');
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
                userId: message.author.id
            }
        );

        const steps = [

        ];
        let success = true;
        for (let i = 0; i < steps.length && success; i++) {
            success = await Promise.resolve(steps[i].call(this, message, guildConfig, auction));
        }
    }
}

export { AuctionCommand };