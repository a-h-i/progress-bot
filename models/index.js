import Sequelize from 'sequelize';
import { GuildConfig } from './guild_config.js';
import { Character } from './character.js';
import * as dbConfig from '../config/config.cjs';
import { logger } from '../config/index.js';

const settings = dbConfig[process.env.NODE_ENV];
settings.logging = logger.debug.bind(logger);

const sequelize = new Sequelize.Sequelize(settings);

GuildConfig.initialize(sequelize);
Character.initialize(sequelize);

export { sequelize, GuildConfig, Character };
