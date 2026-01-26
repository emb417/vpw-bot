import "dotenv/config";
import path from "path";
import { logger, vpw } from "../utils/index.js";

export default {
  commandName: path.basename(import.meta.url).split(".")[0],
  description: "Show list of actions.",

  // No arguments for this command
  options: [],

  callback: async function ({ interaction, channel }) {
    try {
      let response = "";
      const actions = await vpw.getProject(channel.id);

      if (actions && actions.length > 0) {
        actions
          .slice()
          .reverse()
          .slice(0, 10)
          .forEach((a) => {
            if (a.actionType === "checkin") {
              response += `- **${a.version ?? ""}**\t${a.created}:\t<@${a.userId}>\t${a.actionType}\t[link](<${a.link}>)\t${a.comments}\n\n`;
            } else {
              response += `- ${a.created}:\t<@${a.userId}>\t${a.actionType}\n\n`;
            }
          });
      } else {
        response =
          "This channel does not have any actions to list. Use the /checkin command to create a checkin.";
      }

      await interaction.reply({ content: response, flags: 64 });
    } catch (error) {
      logger.error(error.message);
      await interaction.reply({ content: error.message, flags: 64 });
    }
  },
};
