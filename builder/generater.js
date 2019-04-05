function generateRets(rets, prefixBlank) {
    let blank = "                " + prefixBlank;
    let retsKeys = Object.keys(rets);
    let retsList = [];
    for (let i in retsKeys) {
        let ret = "";
        if (typeof rets[retsKeys[i]] === "object") {
            ret = `${blank}${retsKeys[i]}:{\n${generateRets(rets[retsKeys[i]], prefixBlank + "    ")}\n${blank}}`;
        } else {
            if (rets[retsKeys[i]] === "string") {
                ret = blank + `${retsKeys[i]}: ""`;
            }
            if (rets[retsKeys[i]] === "number") {
                ret = blank + `${retsKeys[i]}: 0`;
            }
            if (rets[retsKeys[i]] === "list") {
                ret = blank + `${retsKeys[i]}: []`;
            }
            if (rets[retsKeys[i]] === "object") {
                ret = blank + `${retsKeys[i]}: {}`;
            }
        }
        retsList.push(ret);
    }
    return retsList.join(",\n");
}

function generate(funcDesc) {
    let { handlerName, functions } = funcDesc;
    let func = [];
    for (let i in functions) {
        let funcname = functions[i].name;
        let argsKeys = Object.keys(functions[i].args);
        let argStr = argsKeys.join(",");
        let retStr = generateRets(functions[i].rets, "");
        // let retsKeys = Object.keys(functions[i].rets);
        // let retStr = "                " + retsKeys.join(":\"\",\n                ") + ":\"\"\n";
        let funcStr = `
    async ${funcname}(${argStr}) {
        try {
            this.logger.info(${argStr});
            return {
                error: {
                    code: 0,
                    msg: "success"
                },
${retStr}
            };
        } catch (err) {
            this.logger.error(err);
        }
    }
    `;
        func.push(funcStr);
    }
    func = func.join("\n");
    let handlerStr = `"use strict";
const BaseHandler = require("../base/base_handler");
class ${handlerName}Handler extends BaseHandler {
    constructor() {
        super(...arguments);
    }
${func}
}
module.exports = ${handlerName}Handler;
`;
    return handlerStr;
}
module.exports = generate;