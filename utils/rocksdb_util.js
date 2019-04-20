"use strict";
const level = require("level-rocksdb");
const streamToPromise = require("stream-to-promise");
const path = require("path");
const DB_PATH = path.join(__dirname, "../data");
const dbLogger = require("./log_util")("rocksdb");
class rocksdbUtil {

    constructor() {
        this.init(0);
    }

    init() {
        this.db = level(DB_PATH, {}, (err) => {
            dbLogger.error(err);
        });
        this.logger = dbLogger;
    }
    /**
     * put 存储key value
     * @param {*} key 
     * @param {*} value 
     */
    put(key, value) {
        return new Promise((resolve, reject) => {
            if (typeof value === "object") {
                value = JSON.stringify(value);
            }
            this.db.put(key, value, (err) => {
                if (err) {
                    this.logger.error(`put data error|key=${key}|value=${JSON.stringify(value)}|err=${err.message}`);
                    return reject(err);
                } else {
                    this.logger.debug(`put data success|key=${key}|value=${value}`);
                    resolve(true);
                }
            });
        });
    }

    /**
     * get 根据key获取value
     * @param {*} key 
     * @param {*} value 
     */
    get(key) {
        return new Promise((resolve) => {
            this.db.get(key, (err, value) => {
                if (err) {
                    this.logger.debug(`get data error|key=${key}|err=${err.message}`);
                    resolve(undefined);
                } else {
                    this.logger.debug(`get data success|key=${key}|value=${value}`);
                    try {
                        value = JSON.parse(value);
                    } catch (err) {
                        //do nothing
                    }
                    resolve(value);
                }
            });
        });
    }

    /**
     * del 删除key
     * @param {*} key
     */
    del(key) {
        return new Promise((resolve, reject) => {
            this.db.del(key, (err) => {
                if (err) {
                    return reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    /**
     * 
     * @param {*} ops 
     */
    batch(ops) {
        for (let i = 0; i < ops.length; i++) {
            if (typeof ops[i].value === "object" && ops[i].type === "put") {
                ops[i].value = JSON.stringify(ops[i].value);
            }
        }
        this.logger.debug(`batch ops|${JSON.stringify(ops)}`);
        return new Promise((resolve, reject) => {
            this.db.batch(ops, (err) => {
                if (err) {
                    return reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    /**
     * 查找匹配前缀的
     * @param {*} prefix 
     */
    async find(prefix) {
        try {
            let option = { keys: true, values: true, revers: false, limit: -1, fillCache: false };
            if (prefix) {
                option.gte = prefix;
                option.lt = prefix.substring(0, prefix.length - 1) + String.fromCharCode(prefix[prefix.length - 1].charCodeAt() + 1);
            } else {
                option.gte = "";
            }
            let kvs = await streamToPromise(this.db.createReadStream(option));
            let ret = kvs.map(obj => {
                try {
                    obj.value = JSON.parse(obj.value);
                    return obj;
                } catch (err) {
                    return obj;
                }
            });
            return ret;
        } catch (err) {
            return [];
        }
    }
}

module.exports = new rocksdbUtil();


