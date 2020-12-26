import { BaseCommand } from './base_command.js';
import { Character } from '../models/index.js';

const description = `List characters of mentioned user(s) or your characters if no user(s) mentioned
usage: list [@User1 ... @UserN]`;

/**
 * 
 */
class ListCharacters extends BaseCommand {
    constructor() {
        super('list', description, []);
    }

    async execute(message, guildConfig) {
        
    }
}


export { ListCharacters };