import { BaseCommand } from './base_command.js';
import * as BotConfig from '../config/index.js';
import { GuildConfig } from '../models/index.js';
import { serializeError } from 'serialize-error';
const logger = BotConfig.logger;

const description = `Configure the bot for your own server.
Call with no arguments for interactive mode.
Note that arguments that use mentions can **not** be combined in the same message.
`;


/**
 * configure the bot for your own server
 * call with no arguments for interactive mode
 * parameter should be prefixed by  i.e config prefix $ to set the bot prefix to the $ symbol
 * arguments:
 * list : If present simply lists the current configuration
 * prefix  <string> : set the default prefix, call with no value to get the current prefix
 * starting-level <number> : set the starting level for new characters, defaults to 1. Use with no value to get the current value.
 * starting-gold <positive_real_number> : set the starting gold for new characters, defaults to 0. Use with no value to get the current value, accepts decimals.
 * character-creation-add-roles <@Role1> <@Role2> ... <@Role3> : Allows the mentioned roles to use the create_char command.
 * character-creation-list-roles : list the roles that can create characters
 * character-creation-remove-roles  <@Role1> <@Role2> ... <@Role3> : Removes the mentioned roles from the list of allowed roles.
 * reward-add-roles <@Role1> <@Role2> ... <@Role3> : Allows the mentioned roles use the reward command.
 * reward-list-roles : list the roles that can reward characters with xp and gold
 * reward-remove-roles <@Role1> <@Role2> ... <@Role3> : Removes the mentioned roles from the list 
 *
 * Note: 
 * Arguments that use mentions can not be combined in the same message.
 */
class Config extends BaseCommand {
    constructor() {
        const args = [
            {
                name: 'list',
                description: 'list : if present simply lists the current configuration',
                title: 'List configuration',
                handler: Config.prototype.handleListSubCommand
            },
            {
                name: 'prefix',
                description: 'prefix <string> : set the default prefix, call with no value to get the current prefix. Max length of 64',
                title: 'Bot prefix',
                handler: Config.prototype.handlePrefixSubCommand
            },
            {
                name: 'starting-level',
                description: 'starting-level <number> : set the starting level for new characters, defaults to 1. Use with no value to get the current value. Must be in [1, 20] range',
                default_value: 1,
                title: 'Character starting level',
                handler: Config.prototype.handleStartingLevelSubCommand
            },
            {
                name: 'starting-gold',
                description: 'starting-gold <positive_real_number> : set the starting gold for new characters, defaults to 0. Use with no value to get the current value, accepts decimals.',
                default_value: 0,
                title: 'Character starting gold',
                handler: Config.prototype.handleStartingGoldSubCommand
            },
            {
                name: 'character-creation-add-roles',
                description: 'character-creation-add-roles <@Role1> <@Role2> ... <@Role3> : Allows the mentioned roles to use the create_char command.',
                title: 'Adding character creation role',
                handler: Config.prototype.handleAddCharCreationRoles
            },
            {
                name: 'character-creation-list-roles',
                description: 'character-creation-list-roles : lists the roles that can create characters',
                title: 'List character creation roles',
                handler: Config.prototype.handleListCharacterCreationRoles
            },
            {
                name: 'character-creation-remove-roles',
                description: 'character-creation-remove-roles <@Role1> <@Role2> ... <@Role3> : Removes the mentioned roles from the list of allowed roles.',
                title: 'Remove character creation roles',
                handler: Config.prototype.handleRemoveCharCreationRoles
            },
            {
                name: 'reward-add-roles',
                description: 'reward-add-roles <@Role1> <@Role2> ... <@Role3> : Allows the mentioned roles use the reward command.',
                title: 'Reward Roles',
                handler: Config.prototype.handleAddRewardRoles
            },
            {
                name: 'reward-list-roles',
                description: 'reward-list-roles : lists the roles that can reward characters with xp and gold',
                title: 'List reward roles',
                handler: Config.prototype.handleListRewardRoles
            },
            {
                name: 'reward-remove-roles',
                description: 'reward-remove-roles <@Role1> <@Role2> ... <@Role3> : Removes the mentioned roles from the list',
                title: 'Remove reward roles',
                handler: Config.prototype.handleRemoveRewardRoles
            },
            {
                name: 'config-add-roles',
                description: 'config-add-roles <@Role1> ... <@RoleN> : Allows the mentioned roles to change bot configuration',
                title: 'Config Roles',
                handler: Config.prototype.handleAddConfigRoles
            },
            {
                name: 'config-list-roles',
                description: 'config-list-roles : List roles',
                title: 'List config roles',
                handler: Config.prototype.handleListConfigRoles
            },
            {
                name: 'config-remove-roles',
                description: 'config-remove-roles <@Role1> ... <@RoleN> : Remove roles',
                title: 'Config remove roles',
                handler: Config.prototype.handleRemoveConfigRoles
                
            },
            {
                name: 'retirement-level',
                description: 'retirement-level <number> : If a character is retired before it reaches this level, the character is deleted. Set to 1 if you want to keep all characters. Defaults to 20',
                title: 'Retirement Level',
                handler: Config.prototype.handleRetirementLevelSubCommand
            },
            {
                name: 'reward-formulas-list', 
                description: 'reward-reward-list : Lists reward formulas.',
                title: 'List Formulas',
                handler: Config.prototype.handleListRewardFormulasSubCommand 
            },
            {
                name: 'reward-formulas-add',
                description: 'reward-formulas-add variableName formula : adds a formula that resolves to variableName',
                title: 'Add Formula',
                handler: Config.prototype.handleRewardFormulaAdd
            }, 
            {
                name: 'reward-formulas-remove',
                description: 'reward-formulas-remove variableName : Removes a formula that resolves to variable variableName.',
                title: 'Remove Formula',
                handler: Config.prototype.handleRewardFormulaRemove
            },
            {
                name: 'reward-pools-list',
                description: 'reward-pools-list : Lists current reward pools',
                title: 'List pools',
                handler: Config.prototype.handleListRewardPoolsSubCommand
            },
            {
                name: 'reward-pools-remove',
                description: 'reward-pools-remove poolName',
                title: 'Remove reward pool',
                handler: Config.prototype.handleRemoveRewardPoolSubCommand
            },
            {
                name: 'reward-pools-add',
                description: 'reward-pools-add poolName bonusXp xp',
                title: 'Add reward pool',
                handler: Config.prototype.handleAddRewardPoolSubCommand
            }
        ];
        args.forEach((arg) => {
            if (!arg.hasOwnProperty('handler')) {
                arg.handler = (message) => message.reply('Feature not yet implemented.');
            }
        });
        super([ 'config' ], description, args);
    }

    async execute(message, guildConfig) {
        if (!this.hasPermission(message.member, guildConfig.getConfigRolesAsMap())) {
            // Not allowed
            return this.standardNotAllowedMessage(message);
        }
        if (message.argsArray.length == 0) {
            return await Promise.resolve(this.interactiveConfig(message, guildConfig));
        }
        const subCommand = message.argsArray.shift().toLowerCase();
        for (const arg of this.commandArguments) {
            if (arg.name === subCommand) {
                return await Promise.resolve(arg.handler.call(this, message, guildConfig));
            }
        }
        // invalid usage
        return message.reply(this.createHelpEmbed());

    }

    async interactiveConfig(message, guildConfig) {        
        try {
            const states = [
                this.interactiveModePrefix,
                this.interactiveModeStartingLevel,
                this.interactiveModeStartingGold,
                this.interactiveModeRetirementLevel,
                this.interactiveModeCharCreationRoles,
                this.interactiveModeRewardRoles,
                this.interactiveModeConfigRoles
            ];
            
            let success = true;

            for (let i = 0; i < states.length && success ; i++) {
                success = await states[i].call(this, message, guildConfig);
            }

            if (success) {
                await guildConfig.save();
                return message.reply('Configuration saved!');
            } else {
                return message.reply('Configuration canceled, changes not saved.');
            }
            

        } catch (err) {
            logger.error('Error handling interactive config');
            logger.error(serializeError(err));
            throw err;
        }
        
    }


    async interactiveModePrefix(message, guildConfig) {
        const prompt = `Please enter a prefix to be used by the bot. A prefix can have a max of ${BotConfig.MAX_PREFIX_LENGTH} characters
Current prefix is: ${guildConfig.prefix}
Prefix can contain symbols, but not spaces and is case insensitive.
Reply with c to cancel the entire process.
Reply with s to skip this setting, keeping the current value.`;
        const promptMessage = await message.reply(prompt);
        const filter = reply => reply.author.id == message.author.id;
        return message.channel.awaitMessages(filter, {
            max: 1,
            time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT,
            errors: [ 'time' ]
        }).then( collected => {
            const prefix = collected.first().content.trim().toLowerCase();
            if (prefix === 'c') {
                // cancled process;
                return false;
            } else if (prefix === 's') {
                // skipped step.
                return message.reply('Skipping setting.').then( () => true);
            }
            if (GuildConfig.isValidPreixString(prefix)) {
                guildConfig.prefix = prefix;
                return true;
            } else {
                return false;
            }
        }).catch( async () => {
            await promptMessage.edit('Response timed out');
            return false; 
        });

    }

    async interactiveModeStartingLevel(message, guildConfig) {
        const prompt = `Please enter a starting level. A starting level must be in the range [1, 20].
The current starting level is ${guildConfig.startingLevel}.
Reply with c to cancel the entire process.
Reply with s to skip this setting, keeping the current value.`;
        const replyContentRegex = /^([cs]|\d{1,2})$/i;
        const filter = (reply) => {
            return reply.author.id == message.author.id && replyContentRegex.test(reply.content.trim());
        };
        let retryCount = 0;
        do {
            const promptMessage = await message.reply(prompt);
            const collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT
            });
            if (collected.size == 0) {
                // time elapsed before user reply
                await promptMessage.edit('Response timed out');
                return false;
            }
            let level = collected.first().content.trim().toLowerCase();
            if (level === 'c') {
                // canceled
                return false;
            } else if (level === 's') {
                // skipped
                break;
            }
            level = parseInt(level, 10);
            if (GuildConfig.isValidStartingLevel(level)) {
                guildConfig.startingLevel = level;
                return true;
            } else {
                await message.reply('Value must be between 1-20.');
                retryCount++;
            }
        } while (retryCount < BotConfig.MAX_INTERACTIVE_RETRY_COUNT);
        // Max retry count reached and no valid value entered.
        await message.reply('Skipping setting.');
        return true;
    }

    async interactiveModeRetirementLevel(message, guildConfig) {
        const prompt = `Please enter a level for which to keep track of retired character. Characters under that level
will be permanently deleted if they are retired.
Current retirement level is ${guildConfig.retirementKeepLevel}
Reply with c to cancel the entire process.
Reply with s to skip this setting, keeping the current value.`;
        let retryCount = 0;
        const replyContentRegex = /^([cs]|\d{1,2})$/i;
        const filter = (reply) => {
            return reply.author.id == message.author.id && replyContentRegex.test(reply.content.trim());
        };
        do {
            const promptMessage = await message.reply(prompt);
            const collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT
            });
            if (collected.size == 0) {
                // time elapsed before user reply
                await promptMessage.edit('Response timed out');
                return false;
            }
            let level = collected.first().content.trim().toLowerCase();
            if (level === 'c') {
                // canceled
                return false;
            } else if (level === 's') {
                // skipped
                break;
            }
            level = parseInt(level, 10);
            if (GuildConfig.isValidRetirementKeepLevel(level)) {
                guildConfig.retirementKeepLevel = level;
                return true;
            } else {
                await message.reply('Value must be between 1-20.');
                retryCount++;
            }
        } while (retryCount < BotConfig.MAX_INTERACTIVE_RETRY_COUNT);
        // Max retry count reached and no valid value entered.
        await message.reply('Skipping setting.');
        return true;
    }

    async interactiveModeStartingGold(message, guildConfig) {
        const prompt = `Please enter starting gold value. Value must be positive. Decimals are accepted
The current starting gold value is ${guildConfig.startingGold}
Reply with c to cancel the entire process.
Reply with s to skip this setting, keeping the current value.`;
        const filterRegex = /^([cs]|(\d*\.?\d*))$/i;
        const filter = (reply) => reply.author.id == message.author.id && filterRegex.test(reply.content.trim());
        let retryCount = 0;
        do {
            const promptMessage = await message.reply(prompt);
            const collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT
            });
            if (collected.size == 0) {
                // time elapsed before user reply
                await promptMessage.edit('Response timed out');
                return false;
            }
            let gold = collected.first().content.trim().toLowerCase();
            if (gold === 'c') {
                // canceled
                return false;
            } else if (gold === 's') {
                // skipped
                break;
            }
            gold = parseFloat(gold);
            if (GuildConfig.isValidStartingGold(gold)) {
                guildConfig.startingGold = gold;
                return true;
            } else {
                await message.reply('Value must be valid positive decimal.');
                retryCount++;
            }
        } while (retryCount < BotConfig.MAX_INTERACTIVE_RETRY_COUNT);
        // Max retry count reached and no valid value entered.
        await message.reply('Skipping setting.');
        return true;
    }
    


    /**
     * Helper function for displaying a prompt and then collecting roles.
     * @param {discordjs::Message} message 
     * @param {string} prompt - user prompt
     * @param {function} handler - called with array containing role ids, empty array if none.
     */
    async roleInteractiveHelper(message, prompt, handler) {
        const promptMessage = await message.reply(prompt);
        const filter = (reply) => {
            return reply.author.id == message.author.id;
        };
        const collected = await message.channel.awaitMessages(filter, {
            max: 1,
            time: BotConfig.INTERACTIVE_DEFAULT_TIMEOUT
        });
        if (collected.size == 0) {
            // time elapsed before user reply
            await promptMessage.edit('Response timed out');
            return false;
        }
        const reply = collected.first();
        const content = reply.content.trim().toLowerCase().charAt(0);
        if (content === 'c') {
            // canceled
            return false;
        } else if (content === 's') {
            // skipped
            return true;
        } else {
            const roleIds = [ ...reply.mentions.roles.values() ].map((role) => role.id);
            handler(roleIds);
            return true;
        }
    }


    async interactiveModeCharCreationRoles(message, guildConfig) {
        const prompt = `Please mention the roles you want to have permission to character creation commands.
Note that setting it this way will replace the current list.
reply with c to cancel or s to skip.`;
        const handler = guildConfig.setCharCreationRoles.bind(guildConfig);
        return this.roleInteractiveHelper(message, prompt, handler);
    }
    async interactiveModeRewardRoles(message, guildConfig) {
        const prompt = `Please mention the roles you want to have permission to reward commands.
Note that setting it this way will replace the current list.
reply with c to cancel or s to skip.`;
        const handler = guildConfig.setRewardRoles.bind(guildConfig);
        return this.roleInteractiveHelper(message, prompt, handler);

    }

    async interactiveModeConfigRoles(message, guildConfig) {
        const prompt = `Please mention the roles you want to have permission to configuration commands.
Note that setting it this way will replace the current list.
reply with c to cancel or s to skip.`;
        const handler = guildConfig.setConfigRoles.bind(guildConfig);
        return this.roleInteractiveHelper(message, prompt, handler);
    }

    static rewardFormulasToStringHelper(rewardFormulas) {
        let replyContent = [];
        for ( const variable in rewardFormulas) {
            replyContent.push(`${variable}   =    ${rewardFormulas[variable]}`);
        }
        return replyContent.join('\n');
    }

    async handleListRewardFormulasSubCommand(message, guildConfig) {
        if (Object.getOwnPropertyNames(guildConfig.rewardFormulas).length == 0) {
            return message.reply('No formulas defined.');
        }
        const formulasStr = Config.rewardFormulasToStringHelper(guildConfig.rewardFormulas);
        return message.reply(`Variable - Formula\n${formulasStr}`);
    }

    async handleRewardFormulaAdd(message, guildConfig) {

        if (message.argsArray.length < 2) {
            return message.reply(`Invalid usage. Please  refer to ${BotConfig.DM_REWARDS_WIKI_URL}`);
        }

        const formulaVariable = message.argsArray.shift();
        const formula = message.argsArray.join(' ');
        guildConfig.rewardFormulas[formulaVariable] = formula;
        guildConfig.changed('rewardFormulas', true);
        await guildConfig.save();
        const formulaStr = Config.rewardFormulasToStringHelper(guildConfig.rewardFormulas);
        return message.reply(`Forumla Added
Current Formulas
Variable - Formula
${formulaStr}`);
    }

    async handleRewardFormulaRemove(message, guildConfig) {
        if (message.argsArray.length < 1) {
            return message.reply('Must specify at least one variable name');
        }
        for (const formulaName of message.argsArray) {
            if (guildConfig.rewardFormulas.hasOwnProperty(formulaName) ) {
                delete guildConfig.rewardFormulas[formulaName];
                guildConfig.changed('rewardFormulas', true);
            }
        }
        
        await guildConfig.save();
        await message.reply('Formulas that resolve to specified variables deleted');
        return this.handleListRewardFormulasSubCommand(message, guildConfig);
    }

    /**
     * 
     * @param {discordjs.Message} message 
     * @param {Models.GuildConfig} guildConfig 
     */
    async handleListSubCommand(message, guildConfig) {
        const configEmbed = BaseCommand.createBaseEmbed();
        configEmbed.setTitle('Current Guild Settings');
        const startingValueField = {
            name: 'Prefix and Starting Values',
            inline: false
        };
        startingValueField.value = `Prefix: ${guildConfig.prefix}
Starting Level: ${guildConfig.startingLevel}
Starting Gold: ${guildConfig.startingGold}
Retirement level: ${guildConfig.retirementKeepLevel}`;
        
        const fields = [ startingValueField ];
        if (guildConfig.hasCreationRoles()) {
            const creationRoles = guildConfig.getCharCreationRoles().map((id) => message.guild.roles.cache.get(id)).join('\n');
            fields.push({
                name: 'Character Creation Roles',
                inline: true,
                value: creationRoles.length
            });
        }
        
        if (guildConfig.hasRewardRoles()) {
            const rewardRoles = guildConfig.getRewardRoles().map((id) => message.guild.roles.cache.get(id)).join('\n');
            fields.push({
                name: 'Reward Roles',
                inline: true,
                value: rewardRoles
            });
        }
        if (guildConfig.hasConfigRoles()) {
            const configRoles = guildConfig.getConfigRoles().map((id) => message.guild.roles.cache.get(id)).join('\n');
            fields.push({
                name: 'Configuration Roles',
                inline: true,
                value: configRoles
            });
        }
        

        if (Object.getOwnPropertyNames(guildConfig.rewardFormulas).length != 0) {
            fields.push({
                name: 'Reward Fromulas',
                inline: false,
                value: Config.rewardFormulasToStringHelper(guildConfig.rewardFormulas)
            });
        }
        if (Object.getOwnPropertyNames(guildConfig.rewardPools).length != 0) {
            fields.push({
                name: 'Reward Pools',
                inline: false,
                value: guildConfig.rewardPoolsToString()
            });
        }

        configEmbed.addFields(...fields);
        return message.reply(configEmbed);
    }

    /**
     * @param {string[]} ids - role ids
     * @param {discrodjs.RoleManager} roleManager 
     * @returns {string} comma seperated string of role names
     */
    roleIdsToNamesHelper(ids, roleManager) {
        return ids.map((id) => roleManager.cache.get(id).name).join(', ');
    }

    async handlePrefixSubCommand(message, guildConfig) {
        if (message.argsArray.length == 0) {
            // get current prefix
            return message.reply(`Current prefix is: ${guildConfig.prefix}`);
        }
        const prefix = message.argsArray.shift().toLowerCase();
        if (GuildConfig.isValidPreixString(prefix)) {
            guildConfig.prefix = prefix;
            await guildConfig.save();
            return message.reply(`Prefix changed to ${guildConfig.prefix}`);
        } else {
            return message.reply('Invalid Prefix');
        }
    }

    async handleStartingLevelSubCommand(message, guildConfig) {
        if (message.argsArray.length == 0) {
            // get current starting level
            return message.reply(`Current starting level: ${guildConfig.startingLevel}`);
        }
        const startingLevel = parseInt(message.argsArray.shift(), 10);
        if (GuildConfig.isValidStartingLevel(startingLevel)) {
            guildConfig.startingLevel = startingLevel;
            await guildConfig.save();
            return message.reply(`Starting level set to: ${guildConfig.startingLevel}`);
        } else {
            return message.reply('Invalid starting level');
        }
    }

    async handleStartingGoldSubCommand(message, guildConfig) {
        if (message.argsArray.length == 0) {
            // get current starting gold
            return message.reply(`Current starting gold: ${guildConfig.startingGold}`);
        }
        const startingGold = parseFloat(message.argsArray.shift());
        if (GuildConfig.isValidStartingGold(startingGold)) {
            guildConfig.startingGold = startingGold;
            await guildConfig.save();
            return message.reply(`Starting gold set to ${guildConfig.startingGold}`);
        } else {
            return message.reply('Invalid starting gold');
        }
    }
    
    async handleRetirementLevelSubCommand(message, guildConfig) {
        if (message.argsArray.length == 0) {
            return message.reply(`Current retirement level is: ${guildConfig.retirementKeepLevel}`);
        }
        const retirementKeepLevel = parseInt(message.argsArray.shift(), 10);
        if (GuildConfig.isValidRetirementKeepLevel(retirementKeepLevel)) {
            guildConfig.retirementKeepLevel = retirementKeepLevel;
            await guildConfig.save();
            return message.reply(`Retirement level set to ${guildConfig.retirementKeepLevel}`);
        } else {
            return message.reply('Invalid retirement level');
        }
    }

    listRolesHelper(message, getRoleIds) {
        const roles = getRoleIds().map((id) => message.guild.roles.cache.get(id));
        return message.reply(`Current Roles\n${roles.join(', ')}`, {
            allowedMentions: { roles: [] }
        });
    }

    handleListCharacterCreationRoles(message, guildConfig) {
        return this.listRolesHelper(message, () => guildConfig.getCharCreationRoles());
    }
    
    handleListRewardRoles(message, guildConfig) {
        return this.listRolesHelper(message, () => guildConfig.getRewardRoles());
    }

    handleListConfigRoles(message, guildConfig) {
        return this.listRolesHelper(message, () => guildConfig.getConfigRoles());
    }


    async handleModifyRolesHelper(message, guildConfig, modifierFn, listRolesfn) {
        if (message.mentions.roles.size == 0) {
            return message.reply('Must mention at least one role');
        }
        message.mentions.roles.each((role) => modifierFn(role));
        await guildConfig.save();
        return this.listRolesHelper(message, listRolesfn);
    }

    handleRemoveRewardRoles(message, guildConfig) {
        const listRolesfn = () => guildConfig.getRewardRoles();
        const modifierFn = (role) => guildConfig.removeRewardRole(role.id);
        return this.handleModifyRolesHelper(message, guildConfig, modifierFn, listRolesfn);
    }

    handleAddRewardRoles(message, guildConfig) {
        const listRolesfn = () => guildConfig.getRewardRoles();
        const modifierFn = (role) => guildConfig.addRewardRole(role.id);
        return this.handleModifyRolesHelper(message, guildConfig, modifierFn, listRolesfn);
    }

    handleAddCharCreationRoles(message, guildConfig) {
        const listRolesfn = () => guildConfig.getCharCreationRoles();
        const modifierFn = (role) => guildConfig.addCharCreationRole(role.id);
        return this.handleModifyRolesHelper(message, guildConfig, modifierFn, listRolesfn);
    }

    handleRemoveCharCreationRoles(message, guildConfig) {
        const listRolesfn = () => guildConfig.getCharCreationRoles();
        const modifierFn = (role) => guildConfig.removeCharCreationRole(role.id);
        return this.handleModifyRolesHelper(message, guildConfig, modifierFn, listRolesfn);
    }

    handleAddConfigRoles(message, guildConfig) {
        const listRolesfn = () => guildConfig.getConfigRoles();
        const modifierFn = (role) => guildConfig.addConfigRole(role.id);
        return this.handleModifyRolesHelper(message, guildConfig, modifierFn, listRolesfn);
    }

    handleRemoveConfigRoles(message, guildConfig) {
        const listRolesfn = () => guildConfig.getConfigRoles();
        const modifierFn = (role) => guildConfig.removeConfigRole(role.id);
        return this.handleModifyRolesHelper(message, guildConfig, modifierFn, listRolesfn);
    }

    handleListRewardPoolsSubCommand(message, guildConfig) {
        if (Object.getOwnPropertyNames(guildConfig.rewardPools).length == 0) {
            return message.reply('No reward pools defined.');
        } else {
            const lines = guildConfig.rewardPoolsToString();
            return message.reply(`Pool  -  Variables\n${lines}`);
        }
    }

    async handleRemoveRewardPoolSubCommand(message, guildConfig) {
        if (message.argsArray.length != 1) {
            return this.rewardPoolUsageMessage(message);
        }
        const poolName = message.argsArray.shift();
        if (!guildConfig.hasRewardPool(poolName)) {
            return message.reply(`No pool named ${poolName}`);
        }
        guildConfig.removeRewardPool(poolName);
        await guildConfig.save();
        return this.handleListRewardPoolsSubCommand(message, guildConfig);
    }

    async handleAddRewardPoolSubCommand(message, guildConfig) {
        if (message.argsArray.length < 2) {
            return this.rewardPoolUsageMessage(message);
        }
        const poolName = message.argsArray.shift();
        if (guildConfig.hasRewardPool(poolName)) {
            return message.reply(`Pool ${poolName} already exists, please remove it first.`);
        }
        guildConfig.addRewardPool(poolName, message.argsArray);
        await guildConfig.save();
        return this.handleListRewardPoolsSubCommand(message, guildConfig);
    }

    rewardPoolUsageMessage(message) {
        return message.reply(`Invalid usage, for help with reward pools check ${BotConfig.REWARD_POOLS_WIKI_URL}`);
    }
    
}

export { Config };