// Import mysql2 với promise support để sử dụng async/await
const mysql = require("mysql2/promise");
const dbConfig = require("./src/configs/db.config");

// Tạo connection pool để quản lý kết nối database hiệu quả
// Pool giúp tái sử dụng kết nối thay vì tạo mới mỗi lần query
const db = mysql.createPool({
    host: dbConfig.host,         // Địa chỉ MySQL server
    user: dbConfig.user,         // Username để đăng nhập MySQL
    password: dbConfig.password, // Password của user
    database: dbConfig.database, // Tên database cần kết nối
    port: dbConfig.port,         // Port MySQL (mặc định 3306)
});

// Export db pool để sử dụng ở các file khác
module.exports = db;
