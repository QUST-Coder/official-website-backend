const config = require("../config")["db_config"];
const path = require("path");
const fs = require("fs");
const daoMap = {};
let loadDao = async (type) => {
    await Promise.all(fs.readdirSync(path.join(__dirname, type)).forEach(async file => {
        if (fs.match(".js") === null) return;
        let daoName = file.split(".")[0];
        let dao = require(path.join(__dirname, type, daoName));
        await dao.init();
        daoMap[daoName] = dao;
    }));
};
let init = async () => {
    if (config.db_type === "mongo") {
        await loadDao("mongo");
    }

    if (config.db_type === "mysql") {
        await loadDao("mysql");
    }
};
let getDao = (daoName) => {
    if (daoMap[daoName]) {
        return daoMap[daoName];
    } else {
        throw new Error("dao not found! daoname:" + daoName);
    }
};
module.exports = getDao;
module.exports.init = init;