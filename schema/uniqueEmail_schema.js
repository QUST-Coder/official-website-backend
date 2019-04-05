const Joi = require("Joi");
const schema = {
    email: Joi.string().optional()
};

module.exports.schema = schema;
module.exports.format = (args) => {
    return [args.email];
};