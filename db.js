const mysql = require("mysql2/promise");
const dbConfig = require("./src/configs/db.config");

const db = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port,
});

module.exports = db;
