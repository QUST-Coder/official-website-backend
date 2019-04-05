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
        this.date = moment().format("YYYYMMDD");
        this._initCommon(name);
    }
    _dateUpdate() {
        let nowDate = moment().format("YYYYMMDD");
        if (this.date != nowDate) {
            this.date = nowDate;
            this._initCommon(this.name);
        }
    }
    _initCommon(name) {
        this._commonLogger = createLogger({
            format: format.combine(
                format.errors({ stack: false }),
                format.simple(),
                format.colorize()
            ),
            transports: [
                new transports.File({ filename: path.join(logPath, `${name}_${this.date}.log`), level: "info" }),
                new transports.File({ filename: path.join(logPath, `${name}_error_${this.date}.log`), level: "error" }),
                new transports.File({ filename: path.join(logPath, "debug.log"), level: "debug", maxsize: 1024 * 1024 * 10 })
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
        this._dateUpdate();
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