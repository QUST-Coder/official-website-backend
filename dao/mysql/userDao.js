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
class userDao extends BaseDao {
    constructor() {
        super(...arguments);
        this.table = this.table_prefix + "_user_info";
        this.instance = instance;
        this.fields = {
            f_user_id: "userId",
            f_nickname: "nickname",
            f_qust_email: "qustEmail",
            f_school: "school",
            f_grade: "grade",
            f_brithday: "brithday",
            f_gander: "gander",
            f_avatar_url: "avatar",
            f_intro: "intro",
            f_college: "college",
            f_major: "major"
        };
    }
    genMeta(method, userInfo) {

        let fieldKeys = Object.keys(this.fields);
        let keys = [];
        let values = [];
        let args = [];
        for (let key of fieldKeys) {
            if (userInfo[this.fields[key]]) {
                keys.push(key);
                values.push("?");
                if (keys == "f_avatar_url") {
                    userInfo[this.fields[key]] = encodeURI(userInfo[this.fields[key]]); //防XSS}
                }
                args.push(userInfo[this.fields[key]]);
            }
            if (method === "insert") {
                return {
                    keys: keys.join(","),
                    values: values.join(","),
                    args
                };
            } else if (method === "update") {
                return {
                    keys: keys.join("=?,") + "=?",
                    args: args.push(userInfo.userId)
                };
            }
        }
    }
    /**
     * 
     * @param {*} userInfo 
     */
    async saveUser(userInfo) {
        try {
            if (!userInfo.userId) {
                throw new Error("非法userId");
            }
            let selectSql = `select f_id from ${this.table}`;
            let selectRows = await database.query(selectSql, [], instance);

            if (selectRows.length === 0) {
                //insert
                let meta = this.genMeta("insert", userInfo);
                let sql = `insert into ${this.table} (${meta.keys}) values (${meta.values})`;
                let args = meta.args;
                let rows = await database.query(sql, args, instance);
                return rows;
            } else {
                //update
                let meta = this.genMeta("update", userInfo);
                let sql = `update set ${meta.keys} where f_user_id = ?`;
                let args = meta.args;
                let rows = await database.query(sql, args, instance);
                return rows;
            }
        } catch (err) {
            this.logger.error(`saveUser Error|args=${JSON.stringify(userInfo)}|err=${err.message}`);
            throw err;
        }
    }
    /**
     * 
     * @param {string} userId 
     */
    async getUser(userId) {
        try {
            let sql = `select * from ${this.table} where f_user_id = ?`;
            let args = [userId];
            let rows = await database.query(sql, args, instance);
            return rows;
        } catch (err) {
            this.logger.error(`getUser Error|args=${userId}|err=${err.message}`);
            throw err;
        }
    }


}

module.exports = new userDao();