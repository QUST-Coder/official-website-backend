const BaseClass = require("../base/base_class");
const sessionServer = require("../service/session_server");
let self;
class AuthMiddleware extends BaseClass {
    constructor() {
        super(...arguments);
        self = this;
    }
    async auth(ctx, next) {
        try {
            let accessToken = ctx.request.header["access_token"];
            self.logger.info(`hearer AccessToken|${accessToken || ""}`);
            let req = ctx.request.body;
            let { args } = req;
            if (!accessToken && !args.access_token) {
                //无任何token
                args.login = false;
                //token不匹配
            } else if (args.access_token && accessToken && (args.access_token != accessToken)) {
                throw new Error("报文密钥不匹配");
            } else if (!args.access_token) {
                //如果args中无access_token
                args.access_token = accessToken;
            }
            if (args.access_token) {
                let sessionInfo = await sessionServer.getSession(args.access_token);
                if (sessionInfo.sessionStatus === 0) {
                    args.login = true;
                    args.userData = sessionInfo.userData;
                }
            }
            await next();
        } catch (err) {
            ctx.body = {
                error: {
                    code: -1,
                    msg: "授权校验失败|" + err.message
                }
            };
        }
    }

}
const authMiddleware = new AuthMiddleware();
module.exports = authMiddleware.auth;