const router = require("koa-router")();
const path = require("path");
const fs = require("fs");

const indexReg = new RegExp("\\" + path.sep + "index.js$", "i");

function autoLoadRouters(filePath, router) {
    let stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
        let files = fs.readdirSync(filePath);
        files.forEach(file => {
            autoLoadRouters(filePath + path.sep + file, router);
        });
    } else if (stat.isFile()) {
        if (!indexReg.test(filePath)) {
            let subRouter = require(filePath);
            if (subRouter && subRouter.routes()) {
                router.use(subRouter.router());
            }
        }
    }
}
router.get("/", async (ctx) => {
    ctx.body = "Good luck to you !\nThis is an API server and does not provide web services.";
});
autoLoadRouters(path.resolve(__dirname), router);

module.exports = router;