const BaseHandler = require("../base/base_handler");

class helloHandler extends BaseHandler {
    constructor() {
        super(...arguments);
    }
    async hello() {
        return {
            error: {
                code: 0,
                msg: "success"
            },
            message: "hello world!"
        };
    }

}
module.exports = helloHandler;