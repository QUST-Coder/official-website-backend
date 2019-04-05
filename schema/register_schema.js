const Joi = require("joi");
const schema = {
    userName: Joi.string().optional(),
    password: Joi.string().optional(),
    email: Joi.string().optional(),
    captchaToken: Joi.string().optional(),
};

module.exports.schema = schema;
module.exports.format = (args) => {
    return [args.userName, args.password, args.email, args.captchaToken];
};