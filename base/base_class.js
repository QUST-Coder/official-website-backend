const createLogger = require("../utils/log_util");
const EventEmitter = require("events");
const logInstances = {};
class BaseClass extends EventEmitter {
    constructor() {
        super(...arguments);
        let filename = this.constructor.name;
        if (logInstances[filename]) {
            this.logger = logInstances[filename];
        } else {
            this.logger = createLogger(filename);
        }
    }
}

module.exports = BaseClass;