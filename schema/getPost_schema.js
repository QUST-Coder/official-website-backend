const Joi = require("joi");
const schema = {
    postId: Joi.string().required()
};

module.exports.schema = schema;
module.exports.format = (args) => {
    return [args.postId];
};