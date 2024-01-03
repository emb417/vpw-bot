require('dotenv').config()
const date = require('date-and-time');

class Action {

    constructor(channelId, channelName, userId, username, link, version, comments, actionType){
        let action = new Object();
        action.channelId = channelId;
        action.channelName = channelName;
        action.userId = userId;
        action.username = username;
        action.actionType = actionType;
        action.link = link;
        action.version = version;
        action.comments = comments;
        action.created = date.format(new Date(), 'MM/DD/YYYY HH:mm:ss');

        return action
    };

}

module.exports.Action = Action;