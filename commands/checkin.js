require('dotenv').config()
const path = require('path');
const { OutputHelper } = require('../helpers/outputHelper')
const { VPWDataService } = require('../services/vpwDataService')
const { Action } = require('../models/action')
const Logger = require('../helpers/loggingHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Checkin changes and unlock a project',
  roles: [process.env.BOT_CONTEST_ADMIN_ROLE_NAME],
  channels: process.env.CONTEST_CHANNELS,
  minArgs: 3,
  expectedArgs: '<link> <version> <comments>',
  callback: async ({ args, channel, interaction}) => {
    let logger = (new Logger(null)).logger;
    const outputHelper = new OutputHelper();
    const vpwDataService = new VPWDataService();
    let response;

    try{
      const [link, version, comments] = args;

      const validUrl = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(link);

      if(validUrl) {
        const isCheckedOut = await vpwDataService.isCheckedOut(channel.id);
        const latestStatus = await vpwDataService.getLatestStatus(channel.id);
        const isFirstCheckin = latestStatus ? false : true;
        const userId = interaction?.member?.user?.id;
        const username = interaction?.member?.user?.username;

        if((isCheckedOut && username === latestStatus.username) || isFirstCheckin) {
          let action = new Action(channel.id, channel.name, userId, username, link, version, comments, 'checkin');
          response = await vpwDataService.addAction(action);
        } else if(isCheckedOut) {
          response = '**Check In failed**. You are NOT the user that currently has this project **CHECKED OUT**.\n\n'
            + outputHelper.printLatestAction(latestStatus);
        } else {
          response = '**Check In failed**. The project is **NOT CHECKED OUT**. You need to **CHECK OUT** the project first, then CHECK IN\n\n'
            + outputHelper.printLatestAction(latestStatus);
        }
      } else {
        response = '**Check In failed**. The link parameter was **NOT** a valid URL. Please try again with a valid URL in the link parameter.';
      }
      interaction.reply({content: response, ephemeral: false});
    } catch(error) {
      logger.error(error.message);
      interaction.reply({content: error.message, ephemeral: true});
    }
  },
}