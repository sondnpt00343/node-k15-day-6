const fs = require("fs");
const express = require("express");

const router = express.Router();
const routesDir = __dirname;

const routeFiles = fs
    .readdirSync(routesDir)
    .filter((file) => file.endsWith(".route.js"));

routeFiles.forEach((file) => {
    const routeName = file.replace(".route.js", "");
    const routePath = "/" + routeName;
    const routeModule = require(`@/routes/${routeName}.route`);
    router.use(routePath, routeModule);
});

module.exports = router;
