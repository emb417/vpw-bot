import "dotenv/config";
import path from "path";
import {
  createAction,
  logger,
  printLatestAction,
  vpw,
} from "../utils/index.js";

export default {
  commandName: path.basename(import.meta.url).split(".")[0],
  description: "Checkout and lock a project",

  // No options — this command takes no arguments
  options: [],

  callback: async function ({ interaction, channel }) {
    const LEFT_ARROW = ":arrow_left:";
    let response;

    try {
      const isCheckedOut = await vpw.isCheckedOut(channel.id);
      const latestStatus = await vpw.getLatestStatus(channel.id);

      const userId = interaction.user.id;
      const username = interaction.user.username;

      if (!isCheckedOut && latestStatus) {
        await interaction.deferReply();
        const action = createAction(
          channel.id,
          channel.name,
          userId,
          username,
          null,
          null,
          null,
          "checkout",
        );

        const addResult = await vpw.addAction(action);
        const prefix = `${LEFT_ARROW} ${addResult}`;

        if (action.actionType === "checkout") {
          const latest = await vpw.getLatestStatus(action.channelId);
          response = prefix + `**Latest Link:** <${latest.link}>`;
        }
      } else {
        await interaction.deferReply({ flags: 64 });
        if (!latestStatus) {
          response =
            "**Check Out failed**. There is **NOT** an existing CHECK IN for this project. Please use the /checkin command to create a CHECK IN.";
        } else {
          const status = await vpw.getLatestStatus(channel.id);
          response =
            "This project is already **CHECKED OUT** to the user below.\n\n" +
            printLatestAction(status);
        }
      }

      await interaction.editReply(response);
    } catch (error) {
      logger.error(error.message);
      await interaction.editReply(error.message);
    }
  },
};
