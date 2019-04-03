function generate(funcDesc) {
    let { handlerName, functions } = funcDesc;
    let func = [];
    for (let i in functions) {
        let funcname = functions[i].name;
        let argsKeys = Object.keys(functions[i].args);
        let argStr = argsKeys.join(",");
        let retsKeys = Object.keys(functions[i].rets);
        let retStr = "                " + retsKeys.join(":\"\",\n                ") + ":\"\"\n";
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