require('dotenv').config()
const date = require('date-and-time');

class OutputHelper {

    constructor(){};

    printLatestAction(s) {
      let response;
      const preLabel = s.actionType === 'checkout' ? 'Latest' : '';
          response = `**Status**: ${s.actionType === 'checkin' ? 'CHECKED IN' : 'CHECKED OUT'} by <@${s.userId}> \n` +
                     `**${preLabel} Link**: <${s.link}> \n` + 
                     `**${preLabel} Version**: ${s.version} \n` +
                     `**${preLabel} Comments**: ${s.comments} \n`;  
      return response;
    }
  
    truncate(str, n) {
      if (str.length <= n) return str; // Nothing to do
      return str.slice(0, n-3) + '...';
    }
}

module.exports.OutputHelper = OutputHelper;