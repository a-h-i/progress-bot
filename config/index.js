import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const BOT_TOKEN = process.env.STATERA_BOT_TOKEN;
const DEFAULT_PREFIX = process.env.STATERA_DEFAULT_PREFIX || '$';
const PROJECT_HOME_PAGE = 'https://github.com/a-h-i/progress-bot.git';
const BOT_NAME = 'statera';
const CAPITALIZED_BOT_NAME = BOT_NAME.replace(BOT_NAME[0], BOT_NAME[0].toUpperCase());
const VERSION_STRING = '1.1.0';
const EMBED_FOOTER_ARGS = [ `${CAPITALIZED_BOT_NAME} bot - v${VERSION_STRING}` ];
const EMBED_COLOR = process.env.STATERA_EMBED_COLOR || 'LUMINOUS_VIVID_PINK';
const ISSUES_URL = 'https://github.com/a-h-i/progress-bot/issues';
const DM_REWARDS_WIKI_URL = 'https://github.com/a-h-i/progress-bot/wiki/DM-Rewards';
const REWARD_POOLS_WIKI_URL = 'https://github.com/a-h-i/progress-bot/wiki/DM-Rewards#Using-DM-Rewards';
const BOT_ICON_URL = process.env.STATERA_BOT_ICON_URL || 'https://i.imgur.com/IPjZGrv.png';
const INTERACTIVE_DEFAULT_TIMEOUT = 30000;
const MAX_PREFIX_LENGTH = 64;
/**
 * Must be one of {@link https://discord.js.org/#/docs/main/stable/typedef/ActivityType ActivityType}
 */
const BOT_PRESENCE_ACTIVITY_TYPE = 'PLAYING';
const BOT_PRESENCE_ACTIVITY_NAME = 'D&D';

export { BOT_TOKEN, DEFAULT_PREFIX, PROJECT_HOME_PAGE, BOT_NAME, VERSION_STRING, EMBED_FOOTER_ARGS, CAPITALIZED_BOT_NAME,
    BOT_PRESENCE_ACTIVITY_TYPE, BOT_PRESENCE_ACTIVITY_NAME, EMBED_COLOR, ISSUES_URL,
    DM_REWARDS_WIKI_URL, BOT_ICON_URL, INTERACTIVE_DEFAULT_TIMEOUT, MAX_PREFIX_LENGTH,
    REWARD_POOLS_WIKI_URL };
export { logger } from './logging.js';