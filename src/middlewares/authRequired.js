const db = require("../../db");
const authService = require("../services/authService");

async function authRequired(req, res, next) {
    const accessToken = req.headers?.authorization?.slice(6)?.trim();
    
    const payload = await authService.verifyAccessToken(accessToken);

    if (payload.exp < Date.now() / 1000) {
        return res.status(401).json({
            message: "Unauthorized.",
        });
    }

    const [users] = await db.query(
        "select id, email, created_at from users where id = ?",
        [payload.sub],
    );
    const user = users[0];
    
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized.",
        });
    }

    req.currentUser = user;

    next();
}

module.exports = authRequired;
