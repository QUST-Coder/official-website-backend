const BaseRouter = require("../base/base_router");
const Handler = require("../handler");
const validate = require("../schema");
class ApiRouter extends BaseRouter {
    constructor(...args) {
        super(...args);
    }
    async postApi(ctx) {
        try {
            let { body: req } = ctx.req;
            let { func, args } = req;
            this.logger.info(`req|requestId=${ctx.requestId}|body=${JSON.stringify(req)}`);
            let handler = Handler.getHandler(func);
            args = validate(func, args);
            let rsp = await handler[func](...args);
            this.logger.info(`rsp|requestId=${ctx.requestId}|body=${JSON.stringify(rsp)}`);
            ctx.body = rsp;
        } catch (err) {
            if (err.code) {
                ctx.body = {
                    error: {
                        code: err.code,
                        msg: err.msg
                    }
                };
            } else {
                ctx.body = {
                    error: {
                        code: -1,
                        msg: "system error"
                    }
                };
            }
            this.logger.error(`err|requestId=${ctx.requestId}|code=${err.code || -1}|message=${err.message}`);
        }
    }
    async getApi(ctx) {
        ctx.body = "hello world!";
    }
}

module.exports = ApiRouter;