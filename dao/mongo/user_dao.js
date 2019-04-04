const mongo = require("../../utils/mongo_util");
const instance = require("../../config").configs["db_config"]["db_user"];
const BaseClass = require("../../base/base_class");
class UserDao extends BaseClass {
    constructor() {
        super(...arguments);
        this.instance = instance;
    }
    async init() {
        this.database = await mongo.connect(instance);
    }

}

module.exports = new UserDao();