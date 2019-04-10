const BaseService = require("../base/base_service");
const UserDao = require("../dao")("userDao");
function genUpdateFunction(field) {
    return async (userId, val) => {
        let userInfo = { userId };
        userInfo[field] = val;
        return await UserDao.saveUser(userInfo);
    };
}
class UserServer extends BaseService {
    constructor() {
        super(...arguments);
        let fields = UserDao.fields;
        let keys = Object.keys(fields);
        for (let db_field of keys) {
            let field = fields[db_field];
            field = field[0].toUpperCase() + field.slice(1, field.length);
            this[`update${field}`] = genUpdateFunction(field);
        }
    }
}

module.exports = new UserServer();