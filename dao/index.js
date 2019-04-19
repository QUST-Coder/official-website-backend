const { configs } = require("../config");
const db_config = configs["db_config"];
const path = require("path");
const fs = require("fs");
const daoMap = {};
let loadDao = async (type) => {
    fs.readdirSync(path.join(__dirname, type)).forEach(async file => {
        if (file.match(".js") === null) return;
        let daoName = file.split(".")[0];
        let dao = require(path.join(__dirname, type, daoName));

        daoMap[daoName] = dao;
    });
};
function init() {
    if (!db_config || db_config.db_type === "rocksdb") {
        loadDao("rocksdb");
    } else if (db_config.db_type === "mongo") {
        loadDao("mongo");
    } else if (db_config.db_type === "mysql") {
        loadDao("mysql");
    }
}
init();

let getDao = (daoName) => {
    if (daoMap[daoName]) {
        return daoMap[daoName];
    } else {
        throw new Error("dao not found! daoname:" + daoName);
    }
};
getDao.init = init;
module.exports = getDao;