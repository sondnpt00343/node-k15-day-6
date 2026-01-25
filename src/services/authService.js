const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");

// Service xử lý JWT token (JSON Web Token)
// JWT dùng để xác thực user mà không cần lưu session trên server
class AuthService {
    // Tạo access token mới khi user đăng nhập
    async signAccessToken(user) {
        const ttl = authConfig.accessTokenTTL; // Time to live (thời gian sống)
        
        // Ký token với payload chứa thông tin user
        const accessToken = await jwt.sign(
            {
                sub: user.id,                     // Subject: ID của user
                exp: Date.now() / 1000 + ttl,     // Expire: thời gian hết hạn (timestamp)
            },
            authConfig.jwtSecret, // Secret key để mã hóa
        );
        return accessToken;
    }

    // Xác thực và giải mã token
    // Nếu token không hợp lệ, jwt.verify sẽ throw error
    async verifyAccessToken(accessToken) {
        const payload = await jwt.verify(accessToken, authConfig.jwtSecret);
        return payload; // Trả về payload đã giải mã (chứa sub, exp)
    }
}

// Export instance của class thay vì export class
// Singleton pattern: toàn bộ app dùng chung 1 instance
module.exports = new AuthService();
