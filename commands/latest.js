import "dotenv/config";
import path from "path";
import { logger, printLatestAction, vpw } from "../utils/index.js";

export default {
  commandName: path.basename(import.meta.url).split(".")[0],
  description: "Show latest version link and lock status",

  // No arguments for this command
  options: [],

  callback: async function ({ interaction, channel }) {
    try {
      const latestStatus = await vpw.getLatestStatus(channel.id);
      let response;

      if (latestStatus) {
        response = printLatestAction(latestStatus);
      } else {
        response =
          "This channel does not have a check in. Use the /checkin command to create a check in.";
      }

      await interaction.reply({ content: response, flags: 64 });
    } catch (error) {
      logger.error(error.message);
      await interaction.reply({ content: error.message, flags: 64 });
    }
  },
};
