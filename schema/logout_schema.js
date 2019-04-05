const Joi = require("joi");
const schema = {
    access_token: Joi.string().optional()
};

module.exports.schema = schema;
module.exports.format = (args) => {
    return [args.access_token];
};