import * as Config from './config/index.js';
import * as Discord from 'discord.js';
import * as Commands from './commands/index.js';
import * as Models from './models/index.js';

const client = new Discord.Client({
    presence: {
        activity: {
            type: Config.BOT_PRESENCE_ACTIVITY_TYPE,
            name: Config.BOT_PRESENCE_ACTIVITY_NAME
        }
    }
});
client.commands = new Map();
client.once('ready', () => {
    console.info('Client connected');
});

for (const key in Commands) {
    const command = new Commands[key];
    client.commands.set(command.name, command);
}

client.on('message', message => {
    const guildConfig = new Models.GuildConfig(message.guild.id, Config.DEFAULT_PREFIX);
    if (message.author.bot || !message.content.startsWith(guildConfig.prefix)) return;
    const args = message.content.slice(guildConfig.prefix.length).trim().split(/ +/);
    const command = (args.shift() || 'help').toLowerCase();
    if(client.commands.has(command)) {
        return client.commands.get(command).execute(message, guildConfig);
    } else {
        // Unknown command
        return client.commands.get('help').execute(message, guildConfig);
    }
});

client.login(Config.BOT_TOKEN);
