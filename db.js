const mysql = require("mysql2/promise");

const db = mysql.createPool({
    // Dat ra .env
    host: "localhost",
    user: "admin",
    password: "admin",
    database: "blog_dev2",
    port: 3307,
});

module.exports = db;
