const createLogger = require("./log_util");
const logInstances = {};
class BaseClass {
    constructor() {
        let filename = this.constructor.name;
        if (logInstances[filename]) {
            this.logger = logInstances[filename];
        } else {
            this.logger = createLogger(filename);
        }
    }
}

module.exports = BaseClass;