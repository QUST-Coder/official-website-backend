const Joi = require("joi");
const fs = require("fs");
const path = require("path");
const validates = {};
fs.readdirSync(__dirname).forEach(file => {
    if (file == "index.js" || path.extname(file) !== ".js") return;
    validates[file.split("_")[0]] = require(path.join(__dirname, file));
});
module.exports = (func, args) => {
    let validate = validates[func];
    let { error, value } = Joi.validate(args, validate.schema);
    if (error !== null) {
        throw error;
    }
    return validate.format(value);
};