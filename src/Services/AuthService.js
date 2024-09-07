require("dotenv").config();
const db = require("better-sqlite3")(process.env.DBNAME);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const validateLogin = async (email, pass) => {
    const query = "SELECT * FROM Users WHERE email = ?";
    const row = db.prepare(query).get(email);
    if (!row) {
        return {
            valid: false
        };
    }
    const valid = await bcrypt.compare(pass, row.password);
    if (!valid) {
        return {
            valid: false
        };
    }
    const { Name, ...result } = row;
    const payload = {
        userId: row.id,
        admin: row.admin
    };
    const token = generateToken(payload);
    const returnResult = {
        token,
        Name
    };
    return {
        valid: true,
        result: returnResult
    };
};

const authenticate = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({
                message: "Authorization header missing"
            });
        }
        const token = req.headers.authorization.split(" ")[1];
        const { valid, decodedToken } = validateToken(token);
        if (!valid) {
            throw new Error();
        }
        req.userId = decodedToken.userId;
        req.admin = decodedToken.admin;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
};

const authorize = (req, res, next) => {
    try {
        const admin = req.admin;
        if (admin !== 1) {
            return res.status(401).json({
                message: "Unauthorized action"
            });
        }
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized action"
        });
    }
};

const validateToken = token => {
    try {
        const decodedToken = jwt.verify(token, process.env.SECRETKEY);
        if (!decodedToken.userId) {
            return {
                valid: false
            };
        }
        return {
            valid: true,
            decodedToken
        };
    } catch (err) {
        return {
            valid: false
        };
    }
};

const generateToken = payload => {
    const secretKey = process.env.SECRETKEY;
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
    return token;
};

const createUser = user => {
    const { Name, email, password, admin } = user;

    const existingUser = db.prepare("SELECT * FROM Users WHERE email = ?").get(email);
    if (existingUser) {
        throw new Error("User already exists");
    }

    const query =
        "INSERT INTO Users(Name, email, password, admin, created_at) VALUES(?,?,?,?,?)";
    const changes = db
        .prepare(query)
        .run(Name, email, hashPassword(password), admin, Date.now());
    if (changes.changes === 0) {
        throw new Error("An error occurred while creating a new user");
    }
};

const hashPassword = password => {
    return bcrypt.hashSync(password, 10);
};

module.exports = {
    createUser,
    validateLogin,
    authenticate,
    hashPassword,
    authorize
};
