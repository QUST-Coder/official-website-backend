const hjson = require("hjson");
const path = require("path");
const fs = require("fs");
const BaseClass = require("../base/base_class");

const configs = {};
class ConfigLoader extends BaseClass {
    constructor() {
        super(...arguments);
    }
    async add(filename) {
        const dir = path.dirname(__filename);
        let name = filename.slice(0, filename.lastIndexOf("."));
        name = name.replace("-", "_");
        let text = fs.readFileSync(path.join(dir, filename), "utf8");
        configs[name] = await hjson.parse(text);
        this.logger.info(`configName ${filename} load success|context=${JSON.stringify(configs[name])}`);
    }
}

async function init() {
    let configLoader = new ConfigLoader();
    if (!fs.existsSync(path.join(__dirname, "app_conig.hjson"))) {
        module.exports.configs = {
            app_config: {
                port: "8888",
                server_base: {
                    salt: "salt",
                    user_name_limit: 32,
                    table_prefix: "t",
                    sessionExpireTime: 5 * 60 * 1000
                }
            },
            db_config: {
                db_type: "mysql",
                db_user: {
                    user: "user_test",
                    password: (new Buffer("SEBBaDBJZzk=", "base64").toString()),
                    host: (new Buffer("MTM5LjE5OS4xNi4xNw==", "base64").toString()),
                    port: "3306",
                    database: "db_official_site_test"
                }

            },
        };
        return;
    }
    await configLoader.add("app_config.hjson");
    await configLoader.add("db_config.hjson");
}
module.exports = {
    init,
    configs
};