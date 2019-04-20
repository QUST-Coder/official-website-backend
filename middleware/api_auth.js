const BaseClass = require("../base/base_class");
const sessionServer = require("../service/session_server");
let self;
class AuthMiddleware extends BaseClass {
    constructor() {
        super(...arguments);
        self = this;
    }
    /**
     * 鉴权中间件，用于/api路由下JSON-API的鉴权
     * 实现鉴权的第一步：添加鉴权信息到传递的args对象中
     * 设计思路为：从请求的Header中取出access_token字段，核验该字段的有效性，如果有效
     * 则会从SessionServer中拉取到一组UserData，并为接口的args对象添加该属性，以及一
     * 个login字段。login=true代表用户已登陆，且UserData有效；login=false代表用户
     * 未登陆，且UserData字段无效。
     * @param {*} ctx 
     * @param {*} next 
     */
    async auth(ctx, next) {
        try {
            let accessToken = ctx.request.header["access_token"];
            self.logger.info(`hearer AccessToken|${accessToken || ""}`);
            let req = ctx.request.body;
            let { args } = req;
            if (args.login || args.userData) {
                throw new Error("构造了非法请求！");
            }
            if (!accessToken && !args.access_token) {
                //无任何token
                args.login = false;
                args.userData = {};
                //token不匹配
            } else if (args.access_token && accessToken && (args.access_token != accessToken)) {
                throw new Error("报文密钥不匹配");
            } else if (!args.access_token) {
                //如果args中无access_token
                args.access_token = accessToken;
            }
            if (args.access_token) {
                let sessionInfo = await sessionServer.getSession(args.access_token);
                if (sessionInfo.sessionStatus === 0 || sessionInfo.sessionStatus === 1) {
                    args.login = true;
                    args.userData = sessionInfo.userData;
                }else{
                    args.login = false;
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