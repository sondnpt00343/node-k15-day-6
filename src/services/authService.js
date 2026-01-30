// const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const authConfig = require("../configs/auth.config");
const base64 = require("../utils/base64");
const JsonWebTokenError = require("../classes/errors/JsonWebTokenError");
const randomString = require("../utils/randomString");
const db = require("../../db");

const jwt = {
    sign(payload, secret) {
        // Header
        const jsonHeader = JSON.stringify({
            typ: "JWT",
            alg: "HS256",
        });
        const encodedHeader = base64.encode(jsonHeader, true);

        // Payload
        const jsonPayload = JSON.stringify(payload);
        const encodedPayload = base64.encode(jsonPayload, true);

        // Signature
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${encodedHeader}.${encodedPayload}`);
        const signature = hmac.digest("base64url");

        // JWT token
        const token = `${encodedHeader}.${encodedPayload}.${signature}`;

        return token;
    },
    verify(token, secret) {
        const tokens = token?.split(".");

        if (!tokens) throw new JsonWebTokenError("Khong co token");

        const encodedHeader = tokens[0];
        const encodedPayload = tokens[1];
        const oldSignature = tokens[2];

        // Signature
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${encodedHeader}.${encodedPayload}`);
        const newSignature = hmac.digest("base64url");

        const isValid = newSignature === oldSignature;

        if (isValid) {
            const payload = JSON.parse(base64.decode(encodedPayload, true));
            return payload;
        }

        throw new JsonWebTokenError("Invalid token.");
    },
};

class AuthService {
    async signAccessToken(user) {
        const ttl = authConfig.accessTokenTTL;

        const accessToken = await jwt.sign(
            {
                sub: user.id,
                exp: parseInt(Date.now() / 1000 + ttl),
            },
            authConfig.jwtSecret,
        );
        return accessToken;
    }

    async verifyAccessToken(accessToken) {
        const payload = await jwt.verify(accessToken, authConfig.jwtSecret);
        return payload;
    }

    async createRefreshToken(user, userAgent) {
        let refreshToken,
            isExists = false;

        do {
            refreshToken = randomString();
            const [[{ count }]] = await db.query(
                "select count(*) as count from refresh_tokens where token = ?",
                [refreshToken],
            );
            isExists = count > 0;
        } while (isExists);

        const expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + authConfig.refreshTokenTTL);

        await db.query(
            "insert into refresh_tokens (user_id, token, user_agent, expires_at) values (?, ?, ?, ?)",
            [user.id, refreshToken, userAgent, expiresDate],
        );

        return refreshToken;
    }
}

module.exports = new AuthService();
