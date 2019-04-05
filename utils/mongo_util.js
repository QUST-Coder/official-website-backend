const mongo = require("mongodb").MongoClient;
const instances = {};
class MongoUtil {
    async init(instance) {
        this.database = await new Promise((resolve, reject) => {
            mongo.connect(instance, { useNewUrlParser: true }, (err, db) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(db);
                }
            });
        });
    }
}
let connect = async (instance) => {
    let instanceName = instance.url + instance.database;
    if (instances[instanceName]) {
        return instances[instanceName];
    } else {
        instances[instanceName] = new MongoUtil();
        await instances[instanceName].init(instanceName);
        return instances[instanceName];
    }
};
module.exports.connect = connect;