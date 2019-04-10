process.env.TEST_ENV = "true";
const expect = require("chai").expect;
const testdata = {};
let init = false;
let loginHandler = {};
async function getLoginHandler() {
    if (init) return loginHandler;
    init = true;
    const config = require("../config");
    await config.init();
    const LoginHandler = require("../handler/login_handler");
    loginHandler = new LoginHandler();
    return loginHandler;
}
describe("login handler test", () => {
    describe("test function sign up", () => {
        it("test standard sign up", (done) => {
            (async () => {
                const uuid = require("uuid/v1");
                const strToolkit = require("../utils/str_util");
                const loginHandler = await getLoginHandler();
                testdata.userName = strToolkit.genRandStr({ len: 10 });
                testdata.password = "4d9012b4a77a9524d675dad27c3276ab5705e5e8" //sha1(123321);
                testdata.email = `${strToolkit.genRandStr({ len: 10, symbol: false })}@test.com`;
                testdata.captchaToken = uuid();
                let rsp = await loginHandler.register(testdata.userName, testdata.password, testdata.email, testdata.captchaToken);
                expect(rsp).to.be.a("object");
                expect(rsp.error).to.be.a("object");
                expect(rsp.error.code).to.equal(0);
                expect(rsp.error.msg).to.equal("success");
                done();
            })()
        })
        it("test invalid username", (done) => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.register(testdata.userName + "@#$%^&*", testdata.password, testdata.email, testdata.captchaToken);
                expect(rsp.error.msg).to.equal("用户名必须为4到16位，由字母/数字/下划线构成");
                done();
            })()
        })
        it("test invalid email", (done) => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.register(testdata.userName, testdata.password, testdata.email.replace("@", ""), testdata.captchaToken);
                expect(rsp.error.msg).to.equal("邮箱格式非法");
                done();
            })()
        })

    })
    describe("test function login", () => {
        it("test standard login", (done) => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.login(testdata.userName, testdata.password, testdata.captchaToken, true);
                expect(rsp.error.code).to.equal(0);
                expect(rsp.access_token).to.be.a("string");
                testdata.access_token = rsp.access_token;
                done();
            })()
        })
        it("test invalid username", (done) => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.login(testdata.userName + "123", testdata.password, testdata.captchaToken, true);
                expect(rsp.error.code).to.equal(-1);
                done();
            })()
        })
        it("test wrong password", (done) => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.login(testdata.userName, testdata.password + "123", testdata.captchaToken, true);
                expect(rsp.error.msg).to.equal("用户名或密码错误");
                done();
            })()
        })
    })
    describe("test logout function", () => {
        it("test wrong logout", done => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.logout(testdata.access_token + "123321");
                expect(rsp.error.code).to.equal(0);
                done();
            })()
        })
        it("test standard logout", done => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.logout(testdata.access_token);
                expect(rsp.error.code).to.equal(0);
                done();
            })()
        })
        it("test logout twice", done => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.logout(testdata.access_token);
                expect(rsp.error.code).to.equal(0);
                done();
            })()
        })
    })
    describe("test uniq username login", () => {
        it("test legal uname", (done) => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.uniqueName(testdata.userName + "123");
                expect(rsp.error.code).to.equal(0);
                done();
            })()
        })
        it("test depulicate uname", (done) => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.uniqueName(testdata.userName);
                expect(rsp.error.code).to.equal(-1);
                done();
            })()
        })
    })
    describe("test uniq email login", () => {
        it("test legal email", (done) => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.uniqueEmail(testdata.email + "123");
                expect(rsp.error.code).to.equal(0);
                done();
            })()
        })
        it("test depulicate email", (done) => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.uniqueEmail(testdata.email);
                expect(rsp.error.code).to.equal(-1);
                done();
            })()
        })
    })
    describe("test update password", () => {
        it("test standard invoke", (done) => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.updatePass(testdata.userName, testdata.password, testdata.password + "123", "123321");
                expect(rsp.error.code).to.equal(0);
                done();
            })()
        })
        it("test invalid invoke", (done) => {
            (async () => {
                const loginHandler = await getLoginHandler();
                let rsp = await loginHandler.updatePass(testdata.userName, testdata.password, testdata.password + "123", "123321");
                expect(rsp.error.code).to.equal(-1);
                done();
            })()
        })
    })
})