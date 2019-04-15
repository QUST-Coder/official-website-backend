"use strict";
const BaseHandler = require("../base/base_handler");
class captchaHandler extends BaseHandler {
    constructor() {
        super(...arguments);
    }

    async getCaptcha(pin) {
        try {
            this.logger.info(pin);
            return {
                error: {
                    code: 0,
                    msg: "success"
                },
                img: ""
            };
        } catch (err) {
            this.logger.error(err);
        }
    }


    async checkCaptcha(pin, token) {
        try {
            this.logger.info(pin, token);
            return {
                error: {
                    code: 0,
                    msg: "success"
                }
            };
        } catch (err) {
            this.logger.error(err);
        }
    }

}
module.exports = captchaHandler;
