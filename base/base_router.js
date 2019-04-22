"use strict";
const BaseClass = require("./base_class");
const Router = require("koa-router");
const methods = require("methods");
const uuid = require("uuid/v1");
class BaseRouter extends BaseClass {
    constructor() {
        super(...arguments);
        this.middleware = [];
    }
    init() {
        this.__router = Router();
        this.__router.use(async (ctx, next) => {
            ctx.requestId = ctx.request.header["request_id"] || uuid();
            this.logger.info(`path=${ctx.path}|requestId=${ctx.requestId}`);
            await next();
        });
        //autoware method
        let methodNames = Object.getOwnPropertyNames((Object.getPrototypeOf(this))).filter(name => {
            return typeof (Object.getPrototypeOf(this))[name] === "function" && name != "constructor";
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
                this.middleware.forEach(middleware => {
                    this.__router.use(`/${path}`, middleware);
                });
                if (this.__router[method] && path) {
                    if (path == "api") {
                        this.__router[method]("/api*", (Object.getPrototypeOf(this))[name].bind(this));
                    } else {
                        this.__router[method](`/${path}`, (Object.getPrototypeOf(this))[name].bind(this));
                    }
                }
            }
        });
    }
    // eslint-disable-next-line no-unused-vars
    route(router) {
    }

    mount(path) {
        this.__router.prefix(path);
        this.route.call(this, this.__router);
        return this.__router;
    }

    use(middleware) {
        this.middleware.push(middleware);
    }
}

module.exports = BaseRouter;