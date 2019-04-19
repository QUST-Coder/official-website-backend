const Joi = require("joi");
const schema = {
    postId: Joi.string().require()
};

module.exports.schema = schema;
module.exports.format = (args) => {
    return [args.postId];
};