import path from "path";
import { vpw } from "../utils/index.js";
import { EmbedBuilder } from "discord.js";

export default {
  commandName: path.basename(import.meta.url).split(".")[0],
  description: "Show list of actions.",
  options: [],

  callback: async function ({ interaction, channel }) {
    try {
      const actions = await vpw.getProject(channel.id);

      if (!actions || actions.length === 0) {
        return interaction.reply({
          content:
            "This channel does not have any actions to list. Use /check-in to create one.",
          flags: 64,
        });
      }

      const recent = actions.slice().reverse().slice(0, 10);

      const description = recent
        .map((a) => {
          const line1 = [`\`${a.created}\``, `**${a.actionType}**`].join(" — ");

          if (a.actionType === "checkout") {
            const line2 = `<@${a.userId}>`;
            return `${line1}\n${line2}`;
          }

          if (a.actionType === "checkin") {
            const versionText = a.version
              ? `Version ${a.version} Link`
              : "Version Link";

            const linkedVersion = a.link
              ? `[${versionText}](${a.link})`
              : versionText;

            const line2 = `<@${a.userId}> • ${linkedVersion}`;

            const line3 = a.comments ? `_${a.comments}_` : null;

            return line3
              ? `${line1}\n${line2}\n${line3}`
              : `${line1}\n${line2}`;
          }

          return line1;
        })
        .join("\n\n");

      const embed = new EmbedBuilder()
        .setTitle("📜 Recent Project Activity")
        .setColor("#2b8cff")
        .setDescription(description);

      await interaction.reply({
        embeds: [embed],
        flags: 64,
      });
    } catch (error) {
      logger.error(error.message);
      await interaction.reply({ content: error.message, flags: 64 });
    }
  },
};
