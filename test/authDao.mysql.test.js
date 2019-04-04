/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
async function doTest() {
    const config = require("../config");
    await config.init();
    const authDao = require("../dao/mysql/authDao");
    async function testCreateTable() {
        await authDao.createTable();
    }
    async function testSetUser() {
        let userName = "richard_test";
        let password = "7c4a8d09ca3762af61e59520943dc26494f8941b"; // sha1("123456")
        let email = "123@456.789";
        await authDao.setUser(userName, password, email);
        // userName = "richard_test";
        // password = "4d5c01842f37d90651f9693783c6564279fed6f4";
        // email = "123@456.789";
        // await authDao.setUser(userName, password, email);
        // userName = "";
        // password = "7c4a8d09ca3762af61e59520943dc26494f8941b";
        // email = "123@456.789";
        // await authDao.setUser(userName, password, email);
    }
    async function testActiveUser() {
        let userName = "richard_test";
        await authDao.activeUser(userName);
    }
    async function testVerify() {
        let userName = "richard_test";
        let truePass = "7c4a8d09ca3762af61e59520943dc26494f8941b";
        let falsePass = "7c4a8d09ca3762af61e59520943d123494f8941b";
        let rsp = await Promise.all(
            [
                authDao.verify(userName, truePass),
                authDao.verify(userName, falsePass)
            ]
        );
        console.log(rsp);
    }
    //await testCreateTable();
    //await testSetUser();
    //await testActiveUser();
    await testVerify();
    process.exit(0);
}

doTest();