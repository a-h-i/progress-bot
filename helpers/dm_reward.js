import { mapToDisplayStr } from './formatting.js';


/**
 * 
 * @param {discordjs.GuildMember} member 
 * @param {GuildConfig} guildConfig 
 * @param {DMReward} dmReward 
 * @returns {string} - representation of available rewards based on reward formula pools
 */
function listRewards(member, guildConfig, dmReward) {
    const rewards = new Map();
    const poolNames = guildConfig.getRewardPoolNames();
    poolNames.forEach(poolName => {
        const vars = guildConfig.getRewardPoolVars(poolName);
        const value = dmReward.getValue(vars);
        if (value > 0) {
            rewards.set(poolName, value);
        }
    });

    if (rewards.size == 0) {
        return `No rewards yet for ${member.displayName}`;
    }
    
    return `${member.displayName} Rewards\n${mapToDisplayStr(rewards)}`;


}



export { listRewards };