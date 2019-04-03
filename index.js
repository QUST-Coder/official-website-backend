/* eslint-disable indent */

const config = require("./config");
const BaseClass = require("./base/base_class");
class Main extends BaseClass {
    constructor() {
        super(...arguments);
    }
    async init() {
        await config.init();
    }
    async start() {
        const Koa = require("koa");
        /**
         * init app
         */
        const app = new Koa();
        /**
         * load configs
         */
        await this.init();
        let { configs } = config;
        this.logger.info(`init config success|configs:${Object.keys(configs).join(",")}`);
        /**
         * load common middleware
         */
        const json = require("koa-json");
        const bodyParser = require("koa-bodyparser");
        app.use(bodyParser());
        app.use(json());
        /**
         * load middleware and router
         */
        const router = require("./router");
        app.use(router.routes());
        require("./middleware").forEach(middleware => {
            app.use(middleware);
        });

        /**
         * Get port from config and start
         */
        const http = require("http");
        this.server = http.createServer(app.callback());
        this.port = configs["app_config"].port;
        this.server.listen(this.port);

        /**
         * Event listener for HTTP server "error" event.
         */
        this.server.on("error", (error) => {
            if (error.syscall !== "listen") {
                throw error;
            }
            let bind = typeof this.port === "string" ? "Pipe " + this.port : "Port " + this.port;
            // handle specific listen errors with friendly messages
            switch (error.code) {
                case "EACCES":
                    this.logger.error(bind + " requires elevated privileges");
                    process.exit(1);
                    break;
                case "EADDRINUSE":
                    this.logger.error(bind + " is already in use");
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });

        /**
         * Event listener for HTTP server "listening" event.
         */
        this.server.on("listening", () => {
            let addr = this.server.address();
            this.logger.info(`server listen on ${addr.address}:${addr.port}`);
        });

    }
}


const app = new Main();
app.start();