require("module-alias/register");
require("dotenv").config();

const cors = require("cors");
const express = require("express");

const errorHandle = require("@/middlewares/errorHandle");
const responseMiddleware = require("@/middlewares/response");
const routes = require("@/routes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(responseMiddleware);

app.use("/api", routes);

app.use(errorHandle);

app.listen(port, () => {
    console.log(`Demo app listening on port ${port}`);
});
