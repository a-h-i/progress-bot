import * as Config from './config/index.js';
import * as Discord from 'discord.js';
import * as Command from './commands/index.js';
import { GuildConfig } from './models/index.js';

const client = new Discord.Client({
    presence: {
        activity: {
            type: Config.BOT_PRESENCE_ACTIVITY_TYPE,
            name: Config.BOT_PRESENCE_ACTIVITY_NAME
        }
    }
});
client.once('ready', () => {
    console.info('Client connected');
});

client.commands = new Command.CommandHandler();
for (const commandClass of Command.commandClasses) {
    client.commands.registerCommand(new commandClass());
}

client.on('message', message => {
    if (message.author.bot) return;
    if (message.guild) {
        return GuildConfig.findOrCreate({ id: message.guild.id }).then((guildConfig) => {
            return client.commands.handleMessage(message, guildConfig); 
        }, (reason) => {
            console.error('Promise to find or create rejected client.on message handler');
            console.error(reason);
            return message.reply(`Error handling your message, please report the circumstances on our issues page ${Config.ISSUES_URL}`);
        });
    } else {
        // no associated guild, could be a DM.
        return client.commands.handleMessage(message);
    }
});
client.login(Config.BOT_TOKEN).then((userid) => console.info(`Bot logged in with userid: ${userid}`),
    (err) => {
        console.error('Bot failed to login');
        console.error(err);
    });