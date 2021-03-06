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
const crypto = require("crypto");
const {
    salt,
    user_name_limit,
} = configs["app_config"]["server_base"];

class AuthDao extends BaseDao {

    constructor() {
        super(...arguments);
        this.table = this.table_prefix + "_user_auth";
        this.salt = salt;
        this.zeroPass = crypto.createHash("sha1").update("").digest("hex").toUpperCase();
        this.emailReg = new RegExp("^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$");
        this.illegalNameReg = new RegExp("^[a-zA-Z0-9_]{4,16}$");
        this.instance = instance;
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
        assert(this.illegalNameReg.exec(userName), "用户名必须为4到16位，由字母/数字/下划线构成");
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
            this.logger.error(`verify Error|args=${JSON.stringify({ userName, password })}|err=${err.message}`);
            throw err;
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
            this.logger.error(`setUser Error|args=${JSON.stringify({ userName, password, email })}|err=${err.message}`);
            throw err;
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
            throw err;
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
            throw err;
        }
    }
    /**
     *  检查注册名唯一性
     * @param {string} userName 
     */
    async uniqName(userName) {
        try {
            let sql = `select count(*) from ${this.table} where f_username = ?`;
            let args = [userName];
            let rows = await database.query(sql, args, instance);
            this.logger.debug(`database exec success|sql=${sql}|args=${JSON.stringify(args)}|ret=${JSON.stringify(rows)}`);
            return rows[0]["count(*)"];
        } catch (err) {
            this.logger.error(`uniqName Error|userName=${userName}|err=${err.message}`);
            throw err;
        }
    }
    /**
     *  检查邮件唯一性
     * @param {string} email 
     */
    async uniqEmail(email) {
        try {
            let sql = `select count(*) from ${this.table} where f_email = ?`;
            let args = [email];
            let rows = await database.query(sql, args, instance);
            this.logger.debug(`database exec success|sql=${sql}|args=${JSON.stringify(args)}|ret=${JSON.stringify(rows)}`);
            return rows[0]["count(*)"];
        } catch (err) {
            this.logger.error(`uniqName Error|email=${email}|err=${err.message}`);
            throw err;
        }
    }
    async changePassword(userName, password) {
        try {
            let sql = `update ${this.table} set f_password = ? where f_username = ?`;
            let args = [this.password(password), userName];
            let rows = await database.query(sql, args, instance);
            this.logger.debug(`database exec success|sql=${sql}|args=${JSON.stringify(args)}|ret=${JSON.stringify(rows)}`);
            return rows;
        } catch (err) {
            this.logger.error(`changePassword Error|userName=${userName}|err=${err.message}`);
            throw err;
        }
    }
}

module.exports = new AuthDao();