"use strict";
const BaseHandler = require("../base/base_handler");
class testHandler extends BaseHandler {
    constructor() {
        super(...arguments);
    }

    async func(a,b) {
        try {
            this.logger.info(a,b);
            return {
                error: {
                    code: 0,
                    msg: "success"
                },
                c:{
                    e: 0,
                    kk:{
                        kk:{
                            gg: ""
                        }
                    }
                },
                d: 0,
                f: "",
                aaa: {},
                bbb: []
            };
        } catch (err) {
            this.logger.error(err);
        }
    }
    
}
module.exports = testHandler;
