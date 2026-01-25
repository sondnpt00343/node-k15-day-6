const db = require("../../db");
const authService = require("../services/authService");

// Middleware: Kiểm tra user đã đăng nhập chưa
// Sử dụng cho các route yêu cầu authentication
async function authRequired(req, res, next) {
    // Lấy access token từ header Authorization
    // Format: "Bearer <token>", slice(6) để bỏ chữ "Bearer"
    const accessToken = req.headers?.authorization?.slice(6)?.trim();
    
    // Xác thực token và lấy payload (thông tin đã mã hóa trong token)
    const payload = await authService.verifyAccessToken(accessToken);

    // Kiểm tra token đã hết hạn chưa
    // payload.exp: thời gian hết hạn (timestamp), Date.now()/1000: thời gian hiện tại
    if (payload.exp < Date.now() / 1000) {
        return res.status(401).json({
            message: "Unauthorized.",
        });
    }

    // Kiểm tra user có tồn tại trong database không
    // payload.sub chứa user id đã được mã hóa trong token
    const [users] = await db.query(
        "select id, email, created_at from users where id = ?",
        [payload.sub],
    );
    const user = users[0];
    
    // Nếu không tìm thấy user, trả về lỗi 401
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized.",
        });
    }

    // Gắn thông tin user vào request để sử dụng ở các middleware/route sau
    req.currentUser = user;

    // Chuyển sang middleware/route tiếp theo
    next();
}

module.exports = authRequired;
