"use strict";
const BaseHandler = require("../base/base_handler");
class userHandler extends BaseHandler {
    constructor() {
        super(...arguments);
    }

    async setUserInfo() {
        try {
            this.logger.info();
            return {
                error: {
                    code: 0,
                    msg: "success"
                },

            };
        } catch (err) {
            this.logger.error(err);
        }
    }
    

    async queryMyInfo() {
        try {
            this.logger.info();
            return {
                error: {
                    code: 0,
                    msg: "success"
                },

            };
        } catch (err) {
            this.logger.error(err);
        }
    }
    

    async setQUSTEmail() {
        try {
            this.logger.info();
            return {
                error: {
                    code: 0,
                    msg: "success"
                },

            };
        } catch (err) {
            this.logger.error(err);
        }
    }
    

    async queryUserInfo() {
        try {
            this.logger.info();
            return {
                error: {
                    code: 0,
                    msg: "success"
                },

            };
        } catch (err) {
            this.logger.error(err);
        }
    }
    
}
module.exports = userHandler;
