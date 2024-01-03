require('dotenv').config()
const path = require('path');
const { VPWDataService } = require('../services/vpwDataService')
const Logger = require('../helpers/loggingHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Revert the last action',
  callback: async ({ channel, interaction }) => {
    let logger = (new Logger(null)).logger;
    const vpwDataService = new VPWDataService();

    try{
      let response;
      response = await vpwDataService.removeAction(channel.id, interaction?.user?.id);
      interaction.reply({content: response, ephemeral: false});
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },

}