// eslint-disable-next-line no-unused-vars
const Joi = require("joi");
module.exports.schema = {};
module.exports.format = (args) => {
    return (Object.keys(args)).forEach(key => {
        return args[key];
    });
};