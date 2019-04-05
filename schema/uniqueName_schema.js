const Joi = require("Joi");
const schema = {
    userName: Joi.string().optional()
};

module.exports.schema = schema;
module.exports.format = (args) => {
    return [args.userName];
};