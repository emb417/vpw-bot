import path from "path";
import { vpw, logger } from "../utils/index.js";
import { EmbedBuilder } from "discord.js";

export default {
  commandName: path.basename(import.meta.url).split(".")[0],
  description: "Show the latest action for every project.",
  options: [],

  callback: async function ({ interaction }) {
    try {
      const latestActions = await vpw.getProjects();

      if (!latestActions || latestActions.length === 0) {
        return interaction.reply({
          content: "No projects found.",
          flags: 64,
        });
      }

      // Sort by channelName
      latestActions.sort((a, b) =>
        (a.channelName || "").localeCompare(b.channelName || ""),
      );

      const projectsPerMessage = 5;
      const totalPages = Math.ceil(latestActions.length / projectsPerMessage);

      await interaction.deferReply({ flags: 64 });

      for (let i = 0; i < totalPages; i++) {
        const start = i * projectsPerMessage;
        const end = start + projectsPerMessage;
        const currentProjects = latestActions.slice(start, end);

        const description = currentProjects
          .map((a) => {
            let projectLine = `**<#${a.channelId}>**`;
            const actionLine = [`${a.created}`, `**${a.actionType}**`].join(
              " — ",
            );
            let userCommentLine = `<@${a.userId}>`;

            if (a.actionType === "checkin") {
              const versionText = a.version
                ? `Version ${a.version} Link`
                : null;

              const linkedVersion =
                a.version && a.link ? `[${versionText}](${a.link})` : null;

              projectLine += linkedVersion ? ` • ${linkedVersion}` : "";
              userCommentLine += a.comments ? ` • _${a.comments}_` : "";

              return `${projectLine}\n${actionLine}\n${userCommentLine}`;
            }

            return `${projectLine}\n${actionLine}`;
          })
          .join("\n\n");

        const embed = new EmbedBuilder()
          .setTitle(
            `📑 Latest Project Versions (Page ${i + 1} of ${totalPages})`,
          )
          .setColor("#2b8cff")
          .setDescription(description);

        if (i === 0) {
          await interaction.editReply({
            embeds: [embed],
          });
        } else {
          await interaction.followUp({
            embeds: [embed],
            flags: 64, // Ephemeral
          });
        }
      }
    } catch (error) {
      logger.error(error.message);
      await interaction.reply({ content: error.message, flags: 64 });
    }
  },
};
