"use strict";
const BaseHandler = require("../base/base_handler");
const captchaServer = require("../service/captcha_server");
const sessionServer = require("../service/session_server");
//const authDao = require("../dao/mysql/authDao");
const authDao = require("../dao")("authDao");
class loginHandler extends BaseHandler {
    constructor() {
        super(...arguments);
    }

    async register(userName, password, email, captchaToken) {
        try {
            this.logger.info(`user register|请求|${userName}|${password}|${email}|${captchaToken}`);
            let captchaCheck = await captchaServer.checkCaptchaToken(captchaToken);
            if (!captchaCheck) {
                this.logger.info(`user register|验证码验证不通过|${userName}|${password}|${email}|${captchaToken}`);
                return { error: { code: -1, msg: "验证码验证不通过" } };
            }
            await authDao.setUser(userName, password, email);
            let verifyResult = await authDao.verify(userName, password);
            let userData = verifyResult;
            let access_token = await sessionServer.setSession(userData);
            this.logger.info(`user register|响应|${userName}|${access_token}`);
            return {
                error: { code: 0, msg: "success" },
                access_token
            };
        } catch (err) {
            this.logger.error(err);
            return { error: { code: -1, msg: err.message }, };
        }
    }

    //TODO 记住密码
    async login(userName, password, captchaToken, remember) {
        try {
            this.logger.info(userName, password, captchaToken);
            let captchaCheck = await captchaServer.checkCaptchaToken(captchaToken);
            if (!captchaCheck) {
                return { error: { code: -1, msg: "验证码验证不通过" } };
            }
            let verifyResult = await authDao.verify(userName, password);
            if (!verifyResult.verify) {
                return { error: { code: -1, msg: "用户名或密码错误" } };
            } else {
                let setSessionArgs = [];
                //勾选记住登陆状态session状态为7天
                if (remember) {
                    setSessionArgs = [verifyResult, 7 * 24 * 60 * 60 * 1000, false];
                } else {
                    setSessionArgs = [verifyResult];
                }
                let access_token = await sessionServer.setSession.apply(sessionServer, setSessionArgs);
                return {
                    error: { code: 0, msg: "success" },
                    access_token
                };
            }
        } catch (err) {
            this.logger.error(err);
            return { error: { code: -1, msg: err.message }, };
        }
    }


    async logout(access_token) {
        try {
            this.logger.info(access_token);
            await sessionServer.expireSession(access_token);
            return { error: { code: 0, msg: "success" } };
        } catch (err) {
            this.logger.error(err);
            return { error: { code: -1, msg: err.message } };
        }
    }


    async uniqueName(userName) {
        try {
            this.logger.info(userName);
            let nameCheck = await authDao.uniqName(userName);
            if (!nameCheck) {
                return { error: { code: 0, msg: "success" } };
            } else {
                return { error: { code: -1, msg: "用户名已被注册" } };
            }
        } catch (err) {
            this.logger.error(err);
            return { error: { code: -1, msg: err.message }, };
        }
    }


    async uniqueEmail(email) {
        try {
            this.logger.info(email);
            let emailCheck = await authDao.uniqEmail(email);
            if (!emailCheck) {
                return { error: { code: 0, msg: "success" } };
            } else {
                return { error: { code: -1, msg: "邮箱已被注册" } };
            }
        } catch (err) {
            this.logger.error(err);
            return { error: { code: -1, msg: err.message }, };
        }
    }

    async updatePass(userName, oldPass, newPass, captchaToken) {
        try {
            this.logger.info(userName, oldPass, newPass);
            let captchaCheck = await captchaServer.checkCaptchaToken(captchaToken);
            if (!captchaCheck) {
                this.logger.info(`user register|验证码验证不通过|${userName}|${oldPass}|${newPass}|${captchaToken}`);
                return { error: { code: -1, msg: "验证码验证不通过" } };
            }
            let verifyResult = await authDao.verify(userName, oldPass);
            if (!verifyResult.verify) {
                return { error: { code: -1, msg: "密码错误" } };
            }
            await authDao.changePassword(userName, newPass);
            verifyResult = await authDao.verify(userName, newPass);
            if (!verifyResult.verify) {
                return { error: { code: -1, msg: "密码更改失败，请重试" } };
            }
            return { error: { code: 0, msg: "success" } };
        } catch (err) {
            this.logger.error(err);
            return { error: { code: -1, msg: err.message }, };
        }
    }

}
module.exports = loginHandler;
