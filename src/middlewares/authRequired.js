const prisma = require("@/libs/prisma");
const authService = require("@/services/auth.service");
const { authError, http } = require("@/configs/constants");

async function authRequired(req, res, next) {
    const accessToken = req.headers?.authorization?.slice(6)?.trim();
    const tokenPayload = await authService.verifyAccessToken(accessToken);

    const revokedCount = await prisma.revokedToken.count({
        where: { token: accessToken },
    });

    if (revokedCount > 0 || tokenPayload.exp < Date.now() / 1000) {
        return res.error(authError.unauthorized, http.unauthorized);
    }

    const user = await prisma.user.findUnique({
        where: { id: tokenPayload.sub },
        select: {
            id: true,
            email: true,
            password: true,
            created_at: true,
        },
    });

    if (!user) {
        return res.error(authError.unauthorized, http.unauthorized);
    }

    req.auth = {
        user,
        accessToken,
        tokenPayload,
    };

    next();
}

module.exports = authRequired;
