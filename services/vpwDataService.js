require('dotenv').config()
const fetch = require("node-fetch");

class VPWDataService {
    
    baseApiUrl;
    options;

    constructor(){
        this.baseApiUrl = process.env.VPW_DATA_SERVICE_API_URI;
        this.options = { 
            headers : {
                'Authorization': 'Bearer ODYwMzEwODgxNTc3NDY3OTA0.YN5Y8Q.0P5EwvlXHG6YOtNfkWKt_xOFTtc',
                'Content-Type': 'application/json'
            }
        };
    };

    async getProjects() {
        return (await fetch(`${this.baseApiUrl}/projects`, this.options)).json();
    }

    async getProject(channelId) {
        return (await fetch(`${this.baseApiUrl}/projects/${channelId}`, this.options)).json();
    }

    async getLatestStatus(channelId) {
        let status = new Object();
        let actions = await this.getProject(channelId);

        if(actions.length > 0) {
            let lastAction = actions[actions.length-1];
            let beforeAction = actions.length >= 2 ? actions[actions.length-2] : null;

            status.userId = lastAction.userId;
            status.username = lastAction.username;
            status.actionType = lastAction.actionType;
            if(actions.length == 1 || lastAction.actionType == 'checkin') {
                status.link = lastAction.link;
                status.version = lastAction.version;
                status.comments = lastAction.comments;
                status.created = lastAction.created;
            } else {
                status.link = beforeAction.link;
                status.version = beforeAction.version;
                status.comments = beforeAction.comments;
                status.created = beforeAction.created;
            }
        } else {
            status = null;
        }

       return status;
    }

    async getLastAction(channelId) {
        let lastAction = null;
        let actions = await this.getProject(channelId);

        if(actions.length > 0) {
            lastAction = actions[actions.length-1];
        }

        return lastAction;
    }

    async isCheckedOut(channelId) {
        const latestStatus = await this.getLatestStatus(channelId);
        return latestStatus ? ((latestStatus.actionType ?? 'checkout') === 'checkout' ? true : false) : false;
    }

    async addAction(action) {
        let response;

        await fetch(`${this.baseApiUrl}/projects`
            , { method: 'post', body: JSON.stringify(action), headers: {'Content-Type': 'application/json'}}
        ).then(
            res => {
                response = res.text();
        }).catch(
            error => {
                response = error
        })

        return response;
    };

    async removeAction(channelId, userId) {
        let response;
        const lastAction = await this.getLastAction(channelId);

        if(lastAction?._id) {
            await fetch(`${this.baseApiUrl}/projects/${channelId}?userId=${userId}&actionId=${lastAction?._id}`
                , { method: 'delete', headers: {'Content-Type': 'application/json'}}
            ).then(
                res => {
                    response = res.text();
            }).catch(
                error => {
                    response = error
            })
        } else {
            response = 'Revert failed.  There are no actions to revert.';
        }

        return response;
    };

}

module.exports.VPWDataService = VPWDataService;