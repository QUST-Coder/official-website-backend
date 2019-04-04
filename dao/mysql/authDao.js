/**
 * @author RBWang
 * @version 1.0
 * @since 2019.4.5
 */
"use strict";
const database = require("../../utils/mysql_util");
const { configs } = require("../../config");
const { salt, user_name_limit, table_prefix } = configs["app_config"]["server_base"];
const instance = configs["db_config"]["db_user"];
const BaseClass = require("../../base/base_class");
const assert = require("assert");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

class AuthDao extends BaseClass {

    constructor() {
        super(...arguments);
        this.table = table_prefix + "_user_auth";
        this.salt = salt;
        this.zeroPass = crypto.createHash("sha1").update("").digest("hex").toUpperCase();
        this.emailReg = new RegExp("^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$");
        this.createSql = fs.readFileSync(path.join(__dirname, "t_user_auth.sql"));
    }
    /**
     * 校验保存至数据库的用户信息是否合法
     * @param {string} userName 
     * @param {string} password 
     * @param {string} email 
     */
    checkArgs(userName, password, email) {
        assert(typeof userName === "string", "用户名必须为字符串类型");
        assert(typeof password === "string", "密码必须为字符串类型");
        assert(typeof email === "string", "邮箱必须为字符串类型");
        assert(userName != "", "用户名不能为空");
        assert(userName.length < user_name_limit, "用户名长度超限");
        assert(password !== this.zeroPass, "密码不能为空");
        assert(email != "", "邮箱不能为空");
        assert(this.emailReg.exec(email), "邮箱格式非法");
    }
    /**
     * 对客户端传来的password取加盐哈希
     * @param {*} password
     * @return {string} 
     */
    password(password) {
        let sha1 = crypto.createHash("sha1");
        sha1.update(password + this.salt);
        let hash = sha1.digest("hex");
        return hash;
    }
    /**
     * 建表方法
     */
    async createTable() {
        try {
            let drop = `DROP TABLE IF EXISTS ${this.table}`;
            await database.query(drop, [], instance);
            let sql = this.createSql.replace("{table}", this.table);
            let args = [];
            let rows = await database.query(sql, args, instance);
            this.logger.debug(`database exec success|sql=${sql}|args=${JSON.stringify(args)}|ret=${JSON.stringify(rows)}`);
        } catch (err) {
            this.logger.error(`createTable Error|tableName=${this.table}|err=${err.message}`);
        }
    }
    /**
     * 校验用户身份信息
     * @param {string} userName
     * @param {string} password
     * @returns {{bool,string,int}} 用户名与密码匹配返回true，并附带userId与status；不匹配则返回false
     */
    async verify(userName, password) {
        try {
            let sql = `select f_user_id as userId, f_status as status from ${this.table} where f_userName = ? and f_password = ?`;
            let args = [userName, this.password(password)];
            //query时尽量使用mysql库的预编译模式，有可靠的防注入能力
            let rows = await database.query(sql, args, instance);
            this.logger.debug(`database exec success|sql=${sql}|args=${JSON.stringify(args)}|ret=${JSON.stringify(rows)}`);
            if (rows.length === 1) {
                return {
                    verify: true,
                    userId: rows[0]["userId"],
                    status: rows[0]["status"]
                };
            } else {
                return { verify: false };
            }
        } catch (err) {
            this.logger.error(`verify Error|args=${JSON.stringify(userName, password)}|err=${err.message}`);
        }
    }
    /**
     * 添加新用户到数据库
     * @param {string} userName 
     * @param {String} password 
     * @param {String} email 
     */
    async setUser(userName, password, email) {
        this.checkArgs(...arguments);
        try {
            let sql = `insert into ${this.table} (f_username,f_password,f_email) values (?,?,?)`;
            let args = [userName, this.password(password), email];
            let rows = await database.query(sql, args, instance);
            this.logger.debug(`database exec success|sql=${sql}|args=${JSON.stringify(args)}|ret=${JSON.stringify(rows)}`);
            return rows;
        } catch (err) {
            this.logger.error(`setUser Error|args=${JSON.stringify(userName, password, email)}|err=${err.message}`);
        }
    }
    /**
     * 激活用户状态
     * @param {string} userName 
     */
    async activeUser(userName) {
        try {
            let sql = `update ${this.table} set f_status=1 where f_username = ?`;
            let args = [userName];
            let rows = await database.query(sql, args, instance);
            this.logger.debug(`database exec success|sql=${sql}|args=${JSON.stringify(args)}|ret=${JSON.stringify(rows)}`);
            return rows;
        } catch (err) {
            this.logger.error(`activeUser Error|userName=${userName}|err=${err.message}`);
        }
    }
    /**
     * 反激活用户状态
     * @param {string} userName 
     */
    async deActiveUser(userName) {
        try {
            let sql = `update ${this.table} set f_status=0 where f_username = ?`;
            let args = [userName];
            let rows = await database.query(sql, args, instance);
            this.logger.debug(`database exec success|sql=${sql}|args=${JSON.stringify(args)}|ret=${JSON.stringify(rows)}`);
            return rows;
        } catch (err) {
            this.logger.error(`deActive Error|userName=${userName}|err=${err.message}`);
        }
    }

}

module.exports = new AuthDao();