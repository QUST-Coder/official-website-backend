/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
async function doTest() {
    const config = require("../config");
    await config.init();
    const { configs } = config;
    const sessionServer = require("../service/session_server");
    const sessionDao = require("../dao/mysql/sessionDao");
    const { sleep } = require("../utils/time_util");
    async function testSetGetSession() {
        let userData = { a: 1, b: 2, c: 3 };
        let session = await sessionServer.setSession(userData);
        console.log(session);
        let sessionData = await sessionServer.getSession(session);
        console.log(JSON.stringify(userData));
        console.log(JSON.stringify(sessionData.userData));
    }
    async function testSessionExpire() {
        let userData = { a: 4, b: 5, c: 6 };
        let sessionA = await sessionServer.setSession(userData, 5000);
        let sessionB = await sessionServer.setSession(userData, 1000);
        await sleep(3000);
        let sessionDataA = await sessionServer.getSession(sessionA);
        let sessionDataB = await sessionServer.getSession(sessionB);
        console.log(JSON.stringify(sessionDataA));
        console.log(JSON.stringify(sessionDataB));
    }
    async function testCreateTable() {
        await sessionDao.createTable();
    }
    await testCreateTable();
    await testSetGetSession();
    await testSessionExpire();
}

doTest();