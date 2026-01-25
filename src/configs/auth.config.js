// Cấu hình xác thực (authentication) và mã hóa
const authConfig = {
    // Secret key để ký và xác thực JWT token (phải giữ bí mật)
    jwtSecret: process.env.AUTH_JWT_SECRET,
    
    // Thời gian sống của access token (TTL: Time To Live) tính bằng giây
    // Mặc định 3600 giây = 1 giờ, dấu + convert string sang number
    accessTokenTTL: +process.env.AUTH_ACCESS_TOKEN_TTL || 3600,
    
    // Số vòng lặp mã hóa bcrypt (càng cao càng bảo mật nhưng càng chậm)
    // Mặc định 10 là phù hợp cho hầu hết ứng dụng
    saltRounds: +process.env.AUTH_SALT_ROUNDS || 10,
};

module.exports = authConfig;
