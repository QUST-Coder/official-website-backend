const Joi = require("joi");
const schema = {
    userName: Joi.string().optional(),
    oldPass: Joi.string().optional(),
    newPass: Joi.string().optional(),
    captchaToken: Joi.string().optional(),
};

module.exports.schema = schema;
module.exports.format = (args) => {
    return [args.userName, args.oldPass, args.newPass, args.captchaToken];
};