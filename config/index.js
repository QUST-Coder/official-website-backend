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
    await configLoader.add("app_config.hjson");
    await configLoader.add("db_config.hjson");
}
module.exports = {
    init,
    configs
};