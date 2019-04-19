const Joi = require("joi");
const schema = {
    type: Joi.string().required(),
    title: Joi.string().required(),
    context: Joi.string().required(),
    tags: Joi.string().required(),
    postId: Joi.string().optional().allow("")
};

module.exports.schema = schema;
module.exports.format = (args) => {
    return [args.type, args.title, args.context, args.tags, args.postId];
};