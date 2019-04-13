/**
 * @author RBWang
 * @version 1.0
 * @since 2019.4.5
 */

"use strict";
const database = require("../../utils/mysql_util");
const { configs } = require("../../config");
const instance = configs["db_config"]["db_user"];
const BaseDao = require("../../base/base_dao");
const assert = require("assert");
const moment = require("moment");
const {
    sessionExpireTime
} = configs["app_config"]["server_base"];
class SessionDao extends BaseDao {
    constructor() {
        super(...arguments);
        this.table = this.table_prefix + "_session";
        this.instance = instance;
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
            let dataStr = JSON.stringify(data);
            let sql = `insert into ${this.table} (f_session,f_data,f_expire_time,f_status) values (?,?,?,?)`;
            let args = [session, dataStr, moment(new Date(Date.now() + expireTime)).format("YYYY-MM-DD HH:mm:ss"), flag ? 0 : 1];
            let rows = await database.query(sql, args, instance);
            return rows;
        } catch (err) {
            this.logger.error(`setSession Error|args=${JSON.stringify(session, data, expireTime)}|err=${err.message}`);
            throw err;
        }
    }
    async getSession(session) {
        try {
            let sql = `select f_session,
                    f_data,
                    f_expire_time,
                    f_status
                    from ${this.table} where f_session = ?`;
            let args = [session];
            let rows = await database.query(sql, args, instance);
            return rows[0];
        } catch (err) {
            this.logger.error(`getSession Error|err=${err.message}`);
            throw err;
        }
    }

    async expireSession(session) {
        try {
            let sql = `update ${this.table} set f_status = ? where f_session = ?`;
            let args = [2, session];
            let rows = await database.query(sql, args, instance);
            return rows;
        } catch (err) {
            this.logger.error(err);
            throw err;
        }
    }

    async renewedSession(session, expireTime = sessionExpireTime) {
        try {
            let sql = `update ${this.table} set f_expire_time = ? where f_session = ?`;
            let args = [moment(new Date(Date.now() + expireTime)).format("YYYY-MM-DD HH:mm:ss"), session];
            let rows = await database.query(sql, args, instance);
            return rows;
        } catch (err) {
            this.logger.error(err);
            throw err;
        }
    }
}

module.exports = new SessionDao();