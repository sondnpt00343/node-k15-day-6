// Load các biến môi trường từ file .env vào process.env
require("dotenv").config();

// Import các thư viện cần thiết
const express = require("express"); // Framework Express để xây dựng web server
const bcrypt = require("bcrypt"); // Thư viện mã hóa mật khẩu

// Import các module tự tạo
const errorHandle = require("./src/middlewares/errorHandle"); // Middleware xử lý lỗi tập trung
const db = require("./db"); // Kết nối database MySQL
const authService = require("./src/services/authService"); // Service xử lý JWT token
const authRequired = require("./src/middlewares/authRequired"); // Middleware kiểm tra đăng nhập
const authConfig = require("./src/configs/auth.config"); // Cấu hình xác thực
const constants = require("./src/configs/constants"); // Các hằng số dùng chung

// Khởi tạo ứng dụng Express
const app = express();
const port = 3000; // Port để server chạy

// Lấy các mã HTTP status code để sử dụng
const { httpCodes } = constants;

// Middleware: Cho phép Express đọc dữ liệu JSON từ request body
app.use(express.json());

// Route: Lấy danh sách tất cả bài viết
// - Yêu cầu đăng nhập (authRequired middleware)
// - Trả về mảng các bài viết dưới dạng JSON
app.get("/posts", authRequired, async (req, res) => {
    const [posts] = await db.query(`select * from posts`);
    res.json(posts);
});

// Route: Lấy chi tiết một bài viết theo ID
// - :id là route parameter, lấy từ URL (vd: /posts/5)
// - req.params.id chứa giá trị của :id
app.get("/posts/:id", async (req, res) => {
    const [posts] = await db.query(
        `select * from posts where id = ${req.params.id};`,
    );
    const post = posts[0]; // Lấy bài viết đầu tiên (nếu có)
    
    // Nếu không tìm thấy bài viết, trả về lỗi 404
    if (!post) {
        return res.status(httpCodes.notFound).json({
            message: "Resource not found.",
        });
    }

    // Trả về thông tin bài viết
    res.json(post);
});

// Route: Đăng ký tài khoản mới
// - Nhận email và password từ request body
// - Mã hóa password bằng bcrypt trước khi lưu vào database
// - Trả về thông tin user mới tạo (không bao gồm password)
app.post("/auth/register", async (req, res) => {
    const email = req.body.email;
    
    // Mã hóa mật khẩu với bcrypt (saltRounds: số vòng lặp mã hóa)
    const password = await bcrypt.hash(
        req.body.password,
        authConfig.saltRounds,
    );

    // Insert user mới vào database, dấu ? giúp tránh SQL Injection
    const [{ insertId }] = await db.query(
        `insert into users (email, password) values (?, ?)`,
        [email, password],
    );
    
    // Tạo object user mới với id vừa insert
    const newUser = {
        id: insertId,
        email,
    };
    
    res.json({
        data: newUser,
    });
});

// Route: Lấy thông tin user hiện tại đang đăng nhập
// - Yêu cầu đăng nhập (authRequired middleware)
// - authRequired middleware sẽ gắn thông tin user vào req.currentUser
// - Trả về thông tin user đang đăng nhập
app.get("/auth/me", authRequired, async (req, res) => {
    res.json({
        data: req.currentUser,
    });
});

// Route: Đăng nhập
// - Nhận email và password từ request body
// - Kiểm tra thông tin đăng nhập và trả về JWT token nếu hợp lệ
app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    
    // Tìm user theo email trong database
    const [users] = await db.query(
        `select id, password from users where email = ?`,
        [email],
    );
    const user = users[0];
    
    // Nếu không tìm thấy user, trả về lỗi 401 Unauthorized
    if (!user) {
        return res.status(httpCodes.unauthorized).json({
            message: "Resource not found.",
        });
    }

    // So sánh password nhập vào với password đã mã hóa trong database
    const isValid = await bcrypt.compare(password, user.password);

    // Nếu password đúng, tạo và trả về JWT access token
    if (isValid) {
        const accessToken = await authService.signAccessToken(user);

        return res.json({
            data: {
                access_token: accessToken,
            },
        });
    }

    // Password sai, trả về lỗi 401 Unauthorized
    return res.status(httpCodes.unauthorized).json({
        message: "Unauthorized.",
    });
});

// Middleware xử lý lỗi: PHẢI đặt cuối cùng, sau tất cả các routes
// Bắt mọi lỗi xảy ra trong các routes phía trên và xử lý tập trung
app.use(errorHandle);

// Khởi động server và lắng nghe request tại port đã định
app.listen(port, () => {
    console.log(`Demo app listening on port ${port}`);
});
