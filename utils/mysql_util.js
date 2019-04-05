const mysql = require("mysql");
class MysqlUtil {
    constructor() {
        this.pool = {};
    }

    init(instance) {
        try {
            let poolName = `${instance.host}_${instance.database}`;
            if (!this.pool[poolName]) {
                this.pool[poolName] = mysql.createPool({
                    host: instance.host,
                    user: instance.user,
                    password: instance.password,
                    port: instance.port,
                    database: instance.database
                });
            }
            return this.pool[poolName];
        } catch (err) {
            throw err;
        }
    }

    async query(sql, arr, instance) {
        return await new Promise(async (resolve, reject) => {
            // eslint-disable-next-line no-unused-vars
            (this.init(instance)).query(sql, arr, (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }
}

module.exports = new MysqlUtil();