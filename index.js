import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { handleCheckinModal } from "./commands/check-in.js";
import { logger } from "./utils/index.js";
import { Client, GatewayIntentBits, Partials, REST, Routes } from "discord.js";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(__dirname, process.env.COMMANDS_DIR);

// -----------------------------------------------------
// 1. Create Discord client
// -----------------------------------------------------
logger.info("Starting bot");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// -----------------------------------------------------
// 2. Load command modules
// -----------------------------------------------------
const commands = new Map();
const slashDefinitions = [];

for (const file of fs.readdirSync(commandsPath)) {
  if (!file.endsWith(".js")) continue;

  const commandModule = await import(path.join(commandsPath, file));
  const command = commandModule.default;

  commands.set(command.commandName, command);

  slashDefinitions.push({
    name: command.commandName,
    description: command.description,
    options: command.options ?? [],
  });
}

logger.info(`Loaded ${commands.size} commands`);

// -----------------------------------------------------
// 3. Register slash commands (guild-only for instant updates)
// -----------------------------------------------------
client.once("clientReady", async () => {
  logger.info(`Logged in as ${client.user.tag} :: ${client.user.id}`);
  logger.info("Registering slash commands...");

  const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
    { body: slashDefinitions },
  );

  logger.info("Slash commands registered");
});

// -----------------------------------------------------
// 4. Interaction router
// -----------------------------------------------------
client.on("interactionCreate", async (interaction) => {
  if (interaction.isModalSubmit()) {
    await handleCheckinModal(interaction);
  }

  if (!interaction.isChatInputCommand()) return;

  logger.info(
    `${interaction.user.username} used ${interaction.commandName} for ${interaction.channel.name}`,
  );

  const command = commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`Unknown command: ${interaction.commandName}`);
    return interaction.reply({
      content: "Command not found.",
      flags: 64,
    });
  }

  try {
    await command.callback({
      interaction,
      channel: interaction.channel,
      client,
    });

    if (!interaction.replied && !interaction.deferred) {
      logger.warn(`Command ${interaction.commandName} did not reply!`);
      await interaction.reply({
        content: "Command executed but did not reply.",
      });
    }
  } catch (error) {
    logger.error(error);
    if (!interaction.replied) {
      interaction.reply({
        content: "An error occurred while executing this command.",
        flags: 64,
      });
    }
  }
});

// -----------------------------------------------------
// 5. Login
// -----------------------------------------------------
client.login(process.env.BOT_TOKEN);
