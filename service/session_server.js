const BaseService = require("../base/base_service");
//const sessionDao = require("../dao/mysql/sessionDao");
const sessionDao = require("../dao")("sessionDao");
const stringUtils = require("../utils/str_util");
const { configs } = require("../config");
const {
    sessionExpireTime
} = configs["app_config"]["server_base"];
class SessionServer extends BaseService {
    constructor() {
        super(...arguments);
    }
    /**
     * 将数据保存到数据库，换取一个session
     * expireTime字段不传会使用默认超时时间
     * flag为自动续期标记，默认为true
     * @param {object} userData 
     * @param {int} expireTime 
     * @param {bool} flag
     */
    async setSession(userData, expireTime = sessionExpireTime, flag = true) {
        try {
            let session = stringUtils.genSession();
            await sessionDao.setSession(session, userData, expireTime, flag);
            return session;
        } catch (err) {
            this.logger.error(err);
            throw err;
        }
    }

    async getSession(session) {
        try {
            let sessionStatus = -1;
            let sessionInfo = await sessionDao.getSession(session);
            if (!sessionInfo) {
                return { sessionStatus };//未找到session
            }
            let expireTime = sessionInfo.f_expire_time;
            if (expireTime.getTime() < Date.now()) {
                sessionStatus = 2;
                sessionDao.expireSession(session);
                return { sessionStatus, session };//session已过期
            }
            sessionStatus = sessionInfo.f_status;
            if (sessionStatus == 0) {
                sessionDao.renewedSession(session);
            }
            return {
                sessionStatus,
                userData: JSON.parse(sessionInfo.f_data),
                expireTime: sessionInfo.f_expire_time,
                session
            };
        } catch (err) {
            this.logger.error(err);
            throw err;
        }
    }

    async expireSession(session) {
        try {
            await sessionDao.expireSession(session);
        } catch (err) {
            throw err;
        }
    }


}

module.exports = new SessionServer();