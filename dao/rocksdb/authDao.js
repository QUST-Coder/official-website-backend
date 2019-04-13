/**
 * @author RBWang
 * @version 1.0
 * @since 2019.4.13
 */
"use strict";
const BaseDao = require("../../base/base_dao");
const assert = require("assert");
const crypto = require("crypto");
const { configs } = require("../../config");
const {
    salt,
    user_name_limit,
} = configs["app_config"]["server_base"];
const uuid = require("uuid/v1");
const database = require("../../utils/rocksdb_util");

class AuthDao extends BaseDao {
    constructor() {
        super(...arguments);
        this.table = "authTable_";
        this.emailMap = "email_";
        this.salt = salt;
        this.zeroPass = crypto.createHash("sha1").update("").digest("hex").toUpperCase();
        this.emailReg = new RegExp("^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$");
        this.illegalNameReg = new RegExp("^[a-zA-Z0-9_]{4,16}$");
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
            let data = await database.get(this.table + userName);
            this.logger.debug(`database exec success|op=verify|args=${JSON.stringify([userName, password])}|ret=${JSON.stringify(data)}`);
            if (data.f_password && data.f_password === this.password(password)) {
                return {
                    verify: true,
                    userId: data["f_user_id"],
                    status: data["f_status"]
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
            let check = await Promise.all([
                this.uniqName(userName),
                this.uniqEmail(email)
            ]);
            if (check[0] || check[1]) {
                throw new Error("用户名/邮箱已注册");
            }
            let args = {
                f_user_id: uuid(),
                f_username: userName,
                f_password: this.password(password),
                f_email: email,
                f_create_time: Date.now(),
                f_edit_time: Date.now(),
                f_status: false
            };
            let ops = [
                { type: "put", key: this.table + userName, value: args },
                { type: "put", key: this.table + this.emailMap + email, value: userName }
            ];
            await database.batch(ops);
            this.logger.debug(`database exec success|op=setUser|args=${JSON.stringify(args)}|ret=true`);
            return true;
        } catch (err) {
            this.logger.error(`setUser Error|args=${JSON.stringify(userName, password, email)}|err=${err.message}`);
            throw err;
        }
    }
    /**
     * 激活用户状态
     * @param {string} userName 
     */
    async activeUser(userName) {
        try {
            let data = this.uniqName(userName);
            if (!data) {
                throw new Error("用户未注册！");
            }
            data.f_status = true;
            data.f_edit_time = Date.now();
            await database.put(this.table + userName, data);
            this.logger.debug(`database exec success|op=activeUser|args=${JSON.stringify(data)}|ret=true`);
            return true;
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
            let data = this.uniqName(userName);
            if (!data) {
                throw new Error("用户未注册！");
            }
            data.f_status = false;
            data.f_edit_time = Date.now();
            await database.put(this.table + userName, data);
            this.logger.debug(`database exec success|op=deActiveUser|args=${JSON.stringify(data)}|ret=true`);
            return true;
        } catch (err) {
            this.logger.error(`deActiveUser Error|userName=${userName}|err=${err.message}`);
            throw err;
        }
    }
    /**
     *  检查注册名唯一性
     * @param {string} userName 
     */
    async uniqName(userName) {
        try {
            let data = await database.get(this.table + userName);
            this.logger.debug(`database exec success|op=uniqName|ret=${JSON.stringify(data)}`);
            return data;
        } catch (err) {
            this.logger.error(`uniqName Error|args=${JSON.stringify(userName)}|err=${err.message}`);
            throw err;
        }
    }
    /**
     *  检查邮件唯一性
     * @param {string} email 
     */
    async uniqEmail(email) {
        try {
            let data = await database.get(this.table + this.emailMap + email);
            this.logger.debug(`database exec success|op=uniqueEmail|ret=${JSON.stringify(data)}`);
            return data;
        } catch (err) {
            this.logger.error(`uniqueEmail Error|args=${JSON.stringify(email)}|err=${err.message}`);
            throw err;
        }
    }
    async changePassword(userName, password) {
        try {
            let data = await database.get(this.table + userName);
            data.f_password = this.password(password);
            data.f_edit_time = Date.now();
            await database.put(this.table + userName, data);
            this.logger.debug(`database exec success|op=changePassword|args=${JSON.stringify(data)}|ret=true`);
            return true;
        } catch (err) {
            this.logger.error(`changePassword Error|userName=${userName}|err=${err.message}`);
            throw err;
        }
    }
}

module.exports = new AuthDao();