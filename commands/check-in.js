import "dotenv/config";
import path from "path";
import {
  createAction,
  logger,
  printLatestAction,
  vpw,
} from "../utils/index.js";
import { ModalBuilder, TextInputStyle } from "discord.js";

export default {
  commandName: path.basename(import.meta.url).split(".")[0],
  description: "Check in changes and unlock a project",

  callback: async function ({ interaction, channel }) {
    if (!interaction.isChatInputCommand()) return;

    const modal = new ModalBuilder({
      custom_id: "checkin-modal",
      title: "Check In Project",
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "checkinLink",
              label: "Updated Version Link",
              placeholder: "https://example.com",
              style: TextInputStyle.Short,
              required: true,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "checkinVersion",
              label: "Version ID",
              placeholder: "1.0.0",
              style: TextInputStyle.Short,
              required: true,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "checkinComments",
              label: "Check In Comments",
              placeholder: "Optional comments about this check-in.",
              style: TextInputStyle.Paragraph,
              required: false,
            },
          ],
        },
      ],
    });

    await interaction.showModal(modal);
  },
};

export async function handleCheckinModal(interaction) {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== "checkin-modal") return;

  const RIGHT_ARROW = "➡️";

  try {
    await interaction.deferReply();

    const link = interaction.fields.getTextInputValue("checkinLink");
    const version = interaction.fields.getTextInputValue("checkinVersion");
    const comments = interaction.fields.getTextInputValue("checkinComments");

    let validUrl = true;
    try {
      new URL(link);
    } catch {
      validUrl = false;
    }

    if (!validUrl) {
      await interaction.editReply(
        "**Check In failed**. The link parameter was **NOT** a valid URL.",
      );
      return;
    }

    const channel = interaction.channel;
    const userId = interaction.user.id;
    const username = interaction.user.username;

    const isCheckedOut = await vpw.isCheckedOut(channel.id);
    const latestStatus = await vpw.getLatestStatus(channel.id);
    const isFirstCheckin = !latestStatus;

    let response;

    if (
      (isCheckedOut && username === latestStatus?.username) ||
      isFirstCheckin
    ) {
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
      response =
        "**Check In failed**. You are NOT the user that currently has this project **CHECKED OUT**.\n\n" +
        printLatestAction(latestStatus);
    } else {
      response =
        "**Check In failed**. The project is **NOT CHECKED OUT**. You need to **CHECK OUT** the project first, then CHECK IN.\n\n" +
        printLatestAction(latestStatus);
    }

    await interaction.editReply(response);
  } catch (error) {
    logger.error("Check-in modal failed", error);
    await interaction.editReply(
      "An unexpected error occurred while processing the check-in.",
    );
  }
}
