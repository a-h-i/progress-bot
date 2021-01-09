import Sequelize from 'sequelize';
import { GuildConfig } from './guild_config.js';
import { Character } from './character.js';
import { DMReward } from './dm_rewards.js';
import { TransferLog } from './transfer_log.js';
import { Auction } from './auction.js';
import * as dbConfig from '../config/config.cjs';
import { logger } from '../config/index.js';


const settings = dbConfig[process.env.NODE_ENV];
settings.logging = logger.debug.bind(logger);

const sequelize = new Sequelize.Sequelize(settings);

GuildConfig.initialize(sequelize);
Character.initialize(sequelize);
DMReward.initialize(sequelize);
TransferLog.initialize(sequelize);
Auction.initialize(sequelize);

export { Sequelize, sequelize, GuildConfig, Character, DMReward, TransferLog, Auction };
