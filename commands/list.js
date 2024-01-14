require('dotenv').config()
const path = require('path');
const { VPWDataService } = require('../services/vpwDataService')
const Logger = require('../helpers/loggingHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show list of actions.',
  callback: async ({ channel, interaction }) => {
    let logger = (new Logger(null)).logger;
    const vpwDataService = new VPWDataService();

    try{
      let response = '';
      const actions = await vpwDataService.getProject(channel.id);

      if(actions && actions.length > 0) {
          actions.reverse().slice(0, 10).forEach(a => {
            if(a.actionType === 'checkin') {
              response += `- **${a.version ?? ''}**\t${a.created}:\t<@${a.userId}>\t${a.actionType}\t[link](<${a.link }>)\t${a.comments}\n\n`;
            } else {
              response += `- ${a.created}:\t<@${a.userId}>\t${a.actionType}\t\n\n`;
            }
          });
      } else {
        response = 'This channel does not have any actions to list.  Use the /checkin command to create a checkin.';
      }
      interaction.reply({content: response, ephemeral: true});
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },

}