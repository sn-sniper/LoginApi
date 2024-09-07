const express = require("express");
const router = express.Router();
const { tryCatch, tryCatchAsync } = require("../Services/utils/TryCatch");
const {
    createUser,
    validateLogin
} = require("../Services/AuthService");
const { validateUser } = require("../Services/utils/Validator");

router.post(
    "/api/auth/createUser",
    validateUser,
    tryCatch((req, res) => {
        const body = req.body;
        createUser(body);
        return res.status(201).json({
            message: "User created"
        });
    })
);


router.post(
    "/api/auth/login",
    tryCatchAsync(async (req, res) => {
        const { email, password } = req.body;
        const { valid, result } = await validateLogin(email, password);
        if (!valid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        return res.status(200).json(result);
    })
);

module.exports = router;
