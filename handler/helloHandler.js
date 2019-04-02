const BaseHandler = require("../base/base_handler");

class helloHandler extends BaseHandler {
    constructor() {
        super(...arguments);
    }
    async hello() {
        return "hello world!";
    }

}
module.exports = helloHandler;