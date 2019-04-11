"use strict";
const BaseHandler = require("../base/base_handler");
const fs = require("fs");

class fileHandler extends BaseHandler {
    constructor() {
        super(...arguments);
    }

    async setAvatar(avatar) {
        try {
            this.logger.info(avatar);
            
            return {
                error: {
                    code: 0,
                    msg: "success"
                },
                avatarUrl: ""
            };
        } catch (err) {
            this.logger.error(err);
        }
    }

}
module.exports = fileHandler;
