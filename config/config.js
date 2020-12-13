import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const BOT_TOKEN = process.env.BOT_TOKEN;
const DEFAULT_PREFIX = process.env.DEFAULT_PREFIX;
const PROJECT_HOME_PAGE = 'https://github.com/a-h-i/progress-bot.git';
const BOT_NAME = 'statera';
const CAPITALIZED_BOT_NAME = BOT_NAME.replace(BOT_NAME[0], BOT_NAME[0].toUpperCase());
const VERSION_STRING = '1.0.0';
const EMBED_FOOTER_ARGS = [`${CAPITALIZED_BOT_NAME} bot - v${VERSION_STRING}`];

export { BOT_TOKEN, DEFAULT_PREFIX, PROJECT_HOME_PAGE, BOT_NAME, VERSION_STRING, EMBED_FOOTER_ARGS, CAPITALIZED_BOT_NAME};
