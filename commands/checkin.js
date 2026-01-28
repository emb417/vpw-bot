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
  description: "Check in changes and unlock a project",

  // Slash command options (used during registration)
  options: [
    {
      name: "link",
      description: "The URL to the updated version",
      type: 3,
      required: true,
    },
    {
      name: "version",
      description: "Version identifier",
      type: 3,
      required: true,
    },
    {
      name: "comments",
      description: "Comments about this check-in",
      type: 3,
      required: true,
    },
  ],

  callback: async function ({ interaction, channel }) {
    const RIGHT_ARROW = ":arrow_right:";
    let response;

    try {
      // Extract slash command options
      const link = interaction.options.getString("link");
      const version = interaction.options.getString("version");
      const comments = interaction.options.getString("comments");

      const validUrl =
        /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
          link,
        );

      if (validUrl) {
        const isCheckedOut = await vpw.isCheckedOut(channel.id);
        const latestStatus = await vpw.getLatestStatus(channel.id);
        const isFirstCheckin = !latestStatus;

        const userId = interaction.user.id;
        const username = interaction.user.username;

        if (
          (isCheckedOut && username === latestStatus?.username) ||
          isFirstCheckin
        ) {
          await interaction.deferReply();

          const action = createAction(
            channel.id,
            channel.name,
            userId,
            username,
            link,
            version,
            comments,
            "checkin",
          );

          const result = await vpw.addAction(action);
          response = `${RIGHT_ARROW} ${result}`;
        } else if (isCheckedOut) {
          await interaction.deferReply({ flags: 64 });

          response =
            "**Check In failed**. You are NOT the user that currently has this project **CHECKED OUT**.\n\n" +
            printLatestAction(latestStatus);
        } else {
          await interaction.deferReply({ flags: 64 });

          response =
            "**Check In failed**. The project is **NOT CHECKED OUT**. You need to **CHECK OUT** the project first, then CHECK IN.\n\n" +
            printLatestAction(latestStatus);
        }
      } else {
        await interaction.deferReply({ flags: 64 });

        response =
          "**Check In failed**. The link parameter was **NOT** a valid URL. Please try again with a valid URL.";
      }

      await interaction.editReply(response);
    } catch (error) {
      logger.error(error.message);
      await interaction.editReply(error.message);
    }
  },
};
