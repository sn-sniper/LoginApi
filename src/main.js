const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

const PORT = process.env.PORT || 3030;
const Auth = require("./Routes/Auth");
const errorHandler = require("./Services/utils/ErrorHandler"); 

app.use(Auth);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
