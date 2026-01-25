// Cấu hình kết nối database MySQL
// Lấy giá trị từ biến môi trường (.env file) để bảo mật thông tin nhạy cảm
const dbConfig = {
    host: process.env.DB_HOST || "localhost", // Địa chỉ server MySQL, mặc định localhost
    user: process.env.DB_USER,                // Username MySQL
    password: process.env.DB_PASS,            // Password MySQL
    database: process.env.DB_NAME,            // Tên database
    port: process.env.DB_PORT || 3306,        // Port MySQL, mặc định 3306
};

module.exports = dbConfig;
