const Joi = require("joi");
const schema = {
    index: Joi.object({
        userId: Joi.string().optional(),
        type: Joi.string().optional(),
        title: Joi.string().optional(),
        tags: Joi.string().optional()
    }).required()
};

module.exports.schema = schema;
module.exports.format = (args) => {
    return [args.index];
};