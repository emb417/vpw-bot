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
  description: 'Checkout and lock a project',
  callback: async ({ args, channel, interaction, client, instance }) => {
    let logger = (new Logger(null)).logger;
    const outputHelper = new OutputHelper();
    const vpwDataService = new VPWDataService();
    const LEFT_ARROW = ':arrow_left:';
    let response;
    let isEphemeral = false;

    try{
      const isCheckedOut = await vpwDataService.isCheckedOut(channel.id);
      const latestStatus = await vpwDataService.getLatestStatus(channel.id);
      const userId = interaction?.member?.user?.id;
      const username = interaction?.member?.user?.username;

      if(!isCheckedOut && latestStatus) {
        await interaction.deferReply({ephemeral: isEphemeral});
        let action = new Action(channel.id, channel.name, userId, username, null, null, null, 'checkout');
        await vpwDataService.addAction(action).then(
          async res => {
              res = LEFT_ARROW + ' ' + res;
              if(action.actionType === 'checkout') {
                  await (vpwDataService.getLatestStatus(action.channelId)
                  ).then(latest => {
                      response = res + `**Latest Link:** <${latest.link}>`;
                  });
              };
          }
        )
      } else {
        isEphemeral = true;  
        await interaction.deferReply({ephemeral: isEphemeral});
       
        if(!latestStatus) {
          response = '**Check Out failed**.  There is **NOT** an existing CHECK IN for this project.  Please use the /checkin command to create a CHECK IN.';
        } else {
          response = 'This project is already **CHECKED OUT** to the user below.\n\n' + 
            outputHelper.printLatestAction(await vpwDataService.getLatestStatus(channel.id));
        }
      }
      interaction.editReply(response);

    } catch(error) {
      logger.error(error.message);
      interaction.editReply(error.message);
    }
  },
}