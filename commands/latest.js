require('dotenv').config()
const path = require('path');
const { OutputHelper } = require('../helpers/outputHelper')
const { VPWDataService } = require('../services/vpwDataService')
const Logger = require('../helpers/loggingHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show latest version link and lock status',
  callback: async ({ channel, interaction }) => {
    let logger = (new Logger(null)).logger;
    const outputHelper = new OutputHelper();
    const vpwDataService = new VPWDataService();

    try{
      const latestStatus = await vpwDataService.getLatestStatus(channel.id);
      let response;

      if(latestStatus) {
        response = outputHelper.printLatestAction(latestStatus);
      } else {
        response = 'This channel does not have a check in.  Use the /checkin command to create a check in.';
      }
      interaction.reply({content: response, ephemeral: true});
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },

}