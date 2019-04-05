const Joi = require("joi");
const schema = {
    userName: Joi.string().optional()
};

module.exports.schema = schema;
module.exports.format = (args) => {
    return [args.userName];
};