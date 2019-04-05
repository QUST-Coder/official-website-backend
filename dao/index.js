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


if (db_config.db_type === "mongo") {
    loadDao("mongo");
}

if (db_config.db_type === "mysql") {
    loadDao("mysql");
}

let getDao = (daoName) => {
    if (daoMap[daoName]) {
        return daoMap[daoName];
    } else {
        throw new Error("dao not found! daoname:" + daoName);
    }
};
module.exports = getDao;