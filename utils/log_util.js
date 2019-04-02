const { createLogger, format, transports } = require("winston");
const callsite = require("callsite");
const path = require("path");
const logPath = process.env.LOG_PATH || "./app_log/";
const moment = require("moment");
function lineno() {
    let stack = callsite()[3];
    return `${path.basename(stack.getFileName())}:${stack.getLineNumber()}`;
}
class logger {
    constructor(name) {
        this.name = name;
        this.options = {};
        this._initCommon(name);
    }
    _initCommon(name) {
        this._commonLogger = createLogger({
            format: format.combine(
                format.errors({ stack: false }),
                format.simple(),
                format.colorize()
            ),
            transports: [
                new transports.File({ filename: path.join(logPath, `${name}.log`), level: "info" }),
                new transports.File({ filename: path.join(logPath, `${name}_error.log`), level: "error" }),
                new transports.File({ filename: path.join(logPath, "debug.log"), level: "debug" })
            ]
        });
        if (process.env.NODE_ENV !== "formal") {
            this._commonLogger.add(new transports.Console({
                format: format.combine(
                    format.errors({ stack: false }),
                    format.simple()
                ),
            }));
        }
    }
    _log(level, args) {
        if (args.length === 0) {
            return false;
        }
        let argsStr = [moment().format("YYYY-MM-DD HH:mm:ss"), lineno(), level.toUpperCase(), process.pid, ...args].join("|");
        this._commonLogger[level](argsStr);
    }
    _buildArgs() {
        let argsLen = arguments.length;
        let args = new Array(argsLen);
        for (var i = 0; i < argsLen; i += 1) {
            args[i] = arguments[i];
        }
        return args;
    }
    info() {
        this._log("info", this._buildArgs(...arguments));
    }
    debug() {
        this._log("debug", this._buildArgs(...arguments));
    }
    warn() {
        this._log("warn", this._buildArgs(...arguments));
    }
    error() {
        this._log("error", this._buildArgs(...arguments));
    }


}
module.exports = (name) => {
    return new logger(name);
};