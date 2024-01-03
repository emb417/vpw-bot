require('dotenv').config()
const Logger = require('./helpers/loggingHelper');
const DiscordJS = require('discord.js')
const { Intents } = DiscordJS
const WOKCommands = require('wokcommands')
const path = require('path')

let logger = (new Logger(null)).logger;

logger.info('Starting bot');
logger.info(`APPLICATION_ID: ${process.env.APPLICATION_ID}`);
logger.info(`BOT_TOKEN: ${process.env.BOT_TOKEN}`);
logger.info(`BOT_USER: ${process.env.BOT_USER}`);
logger.info(`COMMANDS_DIR: ${process.env.COMMANDS_DIR}`);
logger.info(`FEATURES_DIR: ${process.env.FEATURES_DIR}`);
logger.info(`DISCORD_BASE_API: ${process.env.DISCORD_BASE_API}`);
logger.info(`GUILD_ID: ${process.env.GUILD_ID}`);
logger.info(`SECONDS_TO_DELETE_MESSAGE: ${process.env.SECONDS_TO_DELETE_MESSAGE}`);
logger.info(`BOT_OWNER: ${process.env.BOT_OWNER}`);
logger.info(`VPW_DATA_SERVICE_API_URI: ${process.env.VPW_DATA_SERVICE_API_URI}`);

const client = new DiscordJS.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
  ],
})

client.on('ready', () => {
    logger.info('Loading commands');
    new WOKCommands(client, {
      commandsDir: path.join(__dirname, process.env.COMMANDS_DIR),
      //featuresDir: path.join(__dirname, process.env.FEATURES_DIR),
      showWarns: false,
      delErrMsgCooldown: process.env.SECONDS_TO_DELETE_MESSAGE,
      botOwners: process.env.BOT_OWNER,
      testServers: process.env.GUILD_ID
    })
    logger.info('Bot is ready for work');
})

client.login(process.env.BOT_TOKEN)