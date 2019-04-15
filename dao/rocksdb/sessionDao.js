/**
 * @author RBWang
 * @version 1.0
 * @since 2019.4.13
 */

"use strict";
const database = require("../../utils/rocksdb_util");
const { configs } = require("../../config");
const BaseDao = require("../../base/base_dao");
const assert = require("assert");
const moment = require("moment");
const {
    sessionExpireTime
} = configs["app_config"]["server_base"];
class SessionDao extends BaseDao {
    constructor() {
        super(...arguments);
        this.table = "sessionTable_";
    }
    /**
     * 
     * @param {string} session 
     * @param {object} data 
     * @param {timestamp} expireTime 
     */
    async setSession(session, data, expireTime = sessionExpireTime, flag) {
        try {
            assert(typeof data === "object", "data值必须为对象");
            let sessionData = {
                f_session: session,
                f_data: data,
                f_expire_time: moment(new Date(Date.now() + expireTime)).format("YYYY-MM-DD HH:mm:ss"),
                f_status: flag ? 0 : 1
            };
            await database.put(this.table + session, sessionData);
            return true;
        } catch (err) {
            this.logger.error(`setSession Error|args=${JSON.stringify(session, data, expireTime)}|err=${err.message}`);
            throw err;
        }
    }

    async getSession(session) {
        try {
            return await database.get(this.table + session);
        } catch (err) {
            this.logger.error(`getSession Error|err=${err.message}`);
            throw err;
        }
    }

    async expireSession(session) {
        try {
            let sessionData = await database.get(this.table + session);
            if (!sessionData) {
                return false;
                //throw new Error("session不存在！");
            }
            sessionData.f_status = 2;
            await database.put(this.table + session, sessionData);
            return true;
        } catch (err) {
            this.logger.error(`expireSession Error ${err}`);
            throw err;
        }
    }

    async renewedSession(session, expireTime = sessionExpireTime) {
        try {
            let sessionData = await database.get(this.table + session);
            if (!sessionData) {
                throw new Error("session不存在！");
            }
            sessionData.f_expire_time = moment(new Date(Date.now() + expireTime)).format("YYYY-MM-DD HH:mm:ss");
            await database.put(this.table + session, sessionData);
            return true;
        } catch (err) {
            this.logger.error(`renewedSession Error ${err}`);
            throw err;
        }
    }
}

module.exports = new SessionDao();