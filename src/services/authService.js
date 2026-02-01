const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const authConfig = require("../configs/auth.config");
const randomString = require("../utils/randomString");
const appConfig = require("../configs/app.config");
const db = require("../../db");

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

    generateVerificationLink(user) {
        const payload = {
            sub: user.id,
            exp: Date.now() / 1000 + authConfig.verificationTokenTTL,
        };
        const token = jwt.sign(payload, authConfig.verificationJwtSecret);
        const verificationLink = `${appConfig.url}/verify-email?token=${token}`;
        return verificationLink;
    }

    async verifyEmail(token) {
        const payload = jwt.verify(token, authConfig.verificationJwtSecret);

        if (payload.exp < Date.now() / 1000) {
            return [true, null];
        }

        const userId = payload.sub;

        const query = `select count(*) as count from users where id = ? and email_verified_at is not null;`;
        const [[{ count }]] = await db.query(query, [userId]);

        if (count > 0) {
            return [true, null];
        }

        await db.query(
            "update users set email_verified_at = now() where id = ?",
            [userId],
        );

        return [false, null];
    }

    async changePassword(user, password, newPassword) {
        // Check mat khau giong nhau
        if (password === newPassword) {
            return ["Mat khau moi phai khac mat khau hien tai.", null];
        }

        // Check mat khau chinh xac
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return ["Mat khau hien tai khong dung", null];
        }

        const hash = await bcrypt.hash(newPassword, authConfig.saltRounds);

        await db.query("update users set password = ? where id = ?", [
            hash,
            user.id,
        ]);

        return [false];
    }
}

module.exports = new AuthService();
