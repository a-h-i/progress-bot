import Sequelize from 'sequelize';
import { GuildConfig } from './guild_config.js';
import * as dbConfig from '../config/config.cjs';

const sequelize = new Sequelize.Sequelize(dbConfig[process.env.NODE_ENV]);

GuildConfig.initialize(sequelize);


export { sequelize, GuildConfig };
