const BaseRouter = require("../base/base_router");
const Handler = require("../handler");
const validate = require("../schema");
const apiAuthMiddleware = require("../middleware/api_auth");
class ApiRouter extends BaseRouter {
    constructor(...args) {
        super(...args);
        this.use(apiAuthMiddleware);
        this.init();
    }
    async postApi(ctx) {
        try {
            let req = ctx.request.body;
            let { func, args } = req;
            this.logger.info(`req|requestId=${ctx.requestId}|body=${JSON.stringify(req)}`);
            let handler = Handler.getHandler(func);
            let { login, userData } = args;
            args = validate(func, args);
            let rsp = await (Object.getPrototypeOf(handler))[func].apply(handler, [...args, userData, login]);
            this.logger.info(`rsp|requestId=${ctx.requestId}|body=${JSON.stringify(rsp)}`);
            ctx.body = rsp;
        } catch (err) {
            if (err.code !== undefined) {
                ctx.body = {
                    error: {
                        code: err.code,
                        msg: err.message
                    }
                };
            } else {
                ctx.body = {
                    error: {
                        code: -1,
                        msg: err.message || "system error"
                    }
                };
            }
            this.logger.error(`err|requestId=${ctx.requestId}|code=${err.code || -1}|message=${err.message}`);
        }
    }
    async getApi(ctx) {
        let handler = Handler.getHandler("hello");
        ctx.body = await (Object.getPrototypeOf(handler))["hello"].apply(handler, []);
    }
}
const instance = new ApiRouter();
module.exports = instance.mount("/");