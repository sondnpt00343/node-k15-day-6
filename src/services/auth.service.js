const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const authConfig = require("@/configs/auth.config");
const { authError } = require("@/configs/constants");
const randomString = require("@/utils/randomString");
const appConfig = require("@/configs/app.config");
const prisma = require("@/libs/prisma");
const queueService = require("@/services/queue.service");

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
        let refreshToken;
        let exists = true;

        while (exists) {
            refreshToken = randomString();
            const count = await prisma.refreshToken.count({
                where: { token: refreshToken },
            });
            exists = count > 0;
        }

        const expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + authConfig.refreshTokenTTL);

        await prisma.refreshToken.create({
            data: {
                user_id: user.id,
                token: refreshToken,
                user_agent: userAgent,
                expires_at: expiresDate,
            },
        });

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
        try {
            const payload = jwt.verify(token, authConfig.verificationJwtSecret);

            if (payload.exp < Date.now() / 1000) {
                return [null, authError.invalidToken];
            }

            const user = await prisma.user.findUnique({
                where: { id: payload.sub },
                select: { id: true, email_verified_at: true },
            });

            if (!user) {
                return [null, authError.invalidToken];
            }

            if (user.email_verified_at) {
                return [null, authError.emailAlreadyVerified];
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { email_verified_at: new Date() },
            });

            return [true, null];
        } catch {
            return [null, authError.invalidToken];
        }
    }

    async register(email, password) {
        const hash = await bcrypt.hash(password, authConfig.saltRounds);
        const user = await prisma.user.create({
            data: { email, password: hash },
            select: { id: true, email: true },
        });
        return user;
    }

    async login(email, password, userAgent) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                password: true,
                email_verified_at: true,
            },
        });

        if (!user) {
            return [null, authError.notFound];
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return [null, authError.unauthorized];
        }

        if (!user.email_verified_at) {
            return [null, authError.emailNotVerified];
        }

        const accessToken = await this.signAccessToken(user);
        const refreshToken = await this.createRefreshToken(user, userAgent);

        return [
            { access_token: accessToken, refresh_token: refreshToken },
            null,
        ];
    }

    async logout(accessToken, tokenPayload) {
        await prisma.revokedToken.create({
            data: {
                token: accessToken,
                expires_at: new Date(tokenPayload.exp * 1000),
            },
        });
    }

    async refreshToken(refreshToken, userAgent) {
        const refreshTokenDB = await prisma.refreshToken.findFirst({
            where: {
                token: refreshToken,
                expires_at: { gte: new Date() },
                is_revoked: { not: "1" },
            },
            select: { id: true, user_id: true },
        });

        if (!refreshTokenDB) {
            return [null, authError.unauthorized];
        }

        const user = { id: refreshTokenDB.user_id };
        const accessToken = await this.signAccessToken(user);
        const newRefreshToken = await this.createRefreshToken(user, userAgent);

        await prisma.refreshToken.update({
            where: { id: refreshTokenDB.id },
            data: { is_revoked: "1" },
        });

        return [
            { access_token: accessToken, refresh_token: newRefreshToken },
            null,
        ];
    }

    getMe(user) {
        const result = { ...user };
        delete result.password;
        return result;
    }

    async resendVerificationEmail(email, password) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, password: true, email_verified_at: true },
        });

        if (!user) {
            return [null, authError.notFound];
        }

        if (user.email_verified_at) {
            return [null, authError.emailAlreadyVerified];
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return [null, authError.unauthorized];
        }

        await queueService.push("sendVerificationEmail", user);
        return [true, null];
    }

    async changePassword(user, password, newPassword) {
        if (password === newPassword) {
            return [null, authError.passwordSame];
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return [null, authError.passwordWrong];
        }

        const hash = await bcrypt.hash(newPassword, authConfig.saltRounds);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hash },
        });

        await queueService.push("sendChangePasswordEmail", {
            id: user.id,
            email: user.email,
        });

        return [true, null];
    }
}

module.exports = new AuthService();
