const Joi = require("joi");
const schema = {
    type: Joi.string().require(),
    title: Joi.string().require(),
    context: Joi.string().require(),
    tags: Joi.string().require(),
    postId: Joi.string().optional().allow("")
};

module.exports.schema = schema;
module.exports.format = (args) => {
    return [args.type, args.title, args.context, args.tags, args.postId];
};