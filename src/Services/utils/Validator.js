const Joi = require("joi");

const validator = schema => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const message = error.details.map(detail => detail.message).join("\n");
        return res.status(400).json({
            message: message
        });
    }
    next();
};

const UserSchema = Joi.object({
    Name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

module.exports = { validateUser: validator(UserSchema) };
