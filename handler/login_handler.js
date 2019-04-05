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
            this.logger.info(userName, password, email, captchaToken);
            let captchaCheck = await captchaServer.checkCaptchaToken(captchaToken);
            if (!captchaCheck) {
                return {
                    error: {
                        code: -1,
                        msg: "验证码验证不通过"
                    }
                };
            }
            await authDao.setUser(userName, password, email);
            let verifyResult = await authDao.verify(userName, password);
            let userData = verifyResult;
            let access_token = await sessionServer.setSession(userData);
            return {
                error: {
                    code: 0,
                    msg: "success"
                },
                access_token
            };
        } catch (err) {
            this.logger.error(err);
            return {
                error: {
                    code: -1,
                    msg: err.message
                }
            };
        }
    }


    async login(userName, password, captchaToken) {
        try {
            this.logger.info(userName, password, captchaToken);
            let captchaCheck = await captchaServer.checkCaptchaToken(captchaToken);
            if (!captchaCheck) {
                return {
                    error: {
                        code: -1,
                        msg: "验证码验证不通过"
                    }
                };
            }
            let verifyResult = await authDao.verify(userName, password);
            if (!verifyResult.verify) {
                return {
                    error: {
                        code: -1,
                        msg: "用户名或密码错误"
                    }
                };
            } else {
                let access_token = await sessionServer.setSession(verifyResult);
                return {
                    error: {
                        code: 0,
                        msg: "success"
                    },
                    access_token
                };
            }
        } catch (err) {
            this.logger.error(err);
            return {
                error: {
                    code: -1,
                    msg: err.message
                }
            };
        }
    }


    async logout(access_token) {
        try {
            this.logger.info(access_token);
            await sessionServer.expireSession(access_token);
            return {
                error: {
                    code: 0,
                    msg: "success"
                },

            };
        } catch (err) {
            this.logger.error(err);
            return {
                error: {
                    code: -1,
                    msg: err.message
                },

            };
        }
    }


    async uniqueName(userName) {
        try {
            this.logger.info(userName);
            let nameCheck = await authDao.uniqName(userName);
            if (!nameCheck) {
                return {
                    error: {
                        code: 0,
                        msg: "success"
                    }
                };
            } else {
                return {
                    error: {
                        code: -1,
                        msg: "用户名已被注册"
                    }
                };
            }
        } catch (err) {
            this.logger.error(err);
            return {
                error: {
                    code: -1,
                    msg: err.message
                },

            };
        }
    }


    async uniqueEmail(email) {
        try {
            this.logger.info(email);
            let emailCheck = await authDao.uniqEmail(email);
            if (!emailCheck) {
                return {
                    error: {
                        code: 0,
                        msg: "success"
                    }
                };
            } else {
                return {
                    error: {
                        code: -1,
                        msg: "邮箱已被注册"
                    }
                };
            }
        } catch (err) {
            this.logger.error(err);
            return {
                error: {
                    code: -1,
                    msg: err.message
                },

            };
        }
    }


}
module.exports = loginHandler;
