const BaseClass = require("./base_class");
const Router = require("koa-router");
const methods = require("methods");
const uuid = require("uuid/v1");
class BaseRouter extends BaseClass {
    constructor() {
        super(...arguments);
        this.__router = Router();
        this.__router.use(async (ctx, next) => {
            ctx.requestId = ctx.request.header["Request-Id"] || uuid();
            this.logger.info(`path=${ctx.path}|requestId=${ctx.requestId}`);
            await next();
        });
        //autoware method
        let methodNames = Object.keys(this.__proto__).filter(name => {
            return typeof this.__proto__[name] === "function";
        });
        let methodNameReg = /([a-z])([A-Z])/;
        // console.log(methods)
        methodNames.forEach(name => {
            let preHandleName = name.replace(methodNameReg, "$1-$2").split("-");
            let method = preHandleName[0];
            if (methods.includes(method)) {
                let path = preHandleName[1].replace(/^./, function (match) {
                    return match.toLowerCase();
                });
                if (this.__router[method] && path) {
                    this.__router[method](`/${path}`, this.__proto__[name].bind(this));
                }
            }
        });
    }
    route() {
    }

    mount(path) {
        this.__router.prefix(path);
        this.route.call(this, this.__router);
        return this.__router;
    }
}

module.exports = BaseRouter;