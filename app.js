import * as Config from './config/index.js';
import * as Discord from 'discord.js';
import * as Command from './commands/index.js';
import {serializeError} from 'serialize-error';

const logger = Config.logger;

const client = new Discord.Client({
    presence: {
        activity: {
            type: Config.BOT_PRESENCE_ACTIVITY_TYPE,
            name: Config.BOT_PRESENCE_ACTIVITY_NAME
        }
    }
});
client.once('ready', () => {
    logger.info('Client connected');
});

client.commandsHandler = new Command.CommandHandler();
for (const commandClass of Command.commandClasses) {
    client.commandsHandler.registerCommand(new commandClass());
}

client.on('message', client.commandsHandler.handleMessage.bind(client.commandsHandler));

client.login(Config.BOT_TOKEN).then((userid) => logger.info(`Bot logged in with userid: ${userid}`),
    (err) => {
        logger.error('Bot failed to login');
        logger.error(serializeError(err));
        process.exit(1);
    });