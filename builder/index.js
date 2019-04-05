const fs = require("fs");
const path = require("path");
const generater = require("./generater");
let protocols = fs.readdirSync(path.join(__dirname, "../protocol"));
let handlers = fs.readdirSync(path.join(__dirname, "../handler"));
function existHandler(handlerName) {
    let fileName = `${handlerName}_handler.js`;
    if (handlers.indexOf(fileName) >= 0) return true;
    return false;
}
protocols.forEach(protocolFileName => {
    let handlerName = protocolFileName.split(".")[0];
    if (existHandler(handlerName)) {
        return;
    }
    let handlerDescStr = fs.readFileSync(path.join(__dirname, "../protocol", protocolFileName));
    let handlerDesc = JSON.parse(handlerDescStr);
    handlerDesc.handlerName = handlerName;
    let handlerContext = generater(handlerDesc);
    fs.writeFileSync(path.join(__dirname, "../handler", `${handlerName}_handler.js`), handlerContext);
});