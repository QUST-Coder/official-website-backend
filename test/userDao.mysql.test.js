/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
async function doTest() {
    const config = require("../config");
    await config.init();
    const userDao = require("../dao/mysql/userDao");
    const moment = require("moment")
    async function testCreateTable() {
        await authDao.createTable();
    }
    async function testSetUser() {
        let userInfo = {
            userId: "100001",
            nickname: "Richard",
            qustEmail: "a@mails.qust.edu.cn",
            school: "qust",
            gander: 1,
            brithday: moment().format("YYYY-MM-DD HH:mm:ss"),
            grade: moment().format("YYYY-MM-DD HH:mm:ss"),
            avatar: "http://a.b.c.d/avatar/x.png",
            intro: "hello world!",
            college: "info",
            major: "ICDESIGN"
        };
        let rows = await userDao.saveUser(userInfo);
        console.log(rows);
    }
    //await testCreateTable();
    await testSetUser();
    process.exit(0);
}

doTest();