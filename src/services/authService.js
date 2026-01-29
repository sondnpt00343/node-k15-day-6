const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");

class AuthService {
    async signAccessToken(user) {
        const ttl = authConfig.accessTokenTTL;
        
        const accessToken = await jwt.sign(
            {
                sub: user.id,
                exp: Date.now() / 1000 + ttl,
            },
            authConfig.jwtSecret,
        );
        return accessToken;
    }

    async verifyAccessToken(accessToken) {
        const payload = await jwt.verify(accessToken, authConfig.jwtSecret);
        return payload;
    }
}

module.exports = new AuthService();
