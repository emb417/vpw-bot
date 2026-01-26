import "dotenv/config";
import path from "path";
import { logger, vpw } from "../utils/index.js";

export default {
  commandName: path.basename(import.meta.url).split(".")[0],
  description: "Revert the last action",

  // No arguments for this command
  options: [],

  callback: async function ({ interaction, channel }) {
    try {
      const response = await vpw.removeAction(channel.id, interaction.user.id);

      await interaction.reply({ content: response, flags: 64 });
    } catch (error) {
      logger.error(error.message);
      await interaction.reply({ content: error.message, flags: 64 });
    }
  },
};
