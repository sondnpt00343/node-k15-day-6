require("dotenv").config();

const cors = require("cors");
const express = require("express");
const bcrypt = require("bcrypt");

const db = require("./db");
const errorHandle = require("./src/middlewares/errorHandle");
const authService = require("./src/services/authService");
const authRequired = require("./src/middlewares/authRequired");
const authConfig = require("./src/configs/auth.config");
const constants = require("./src/configs/constants");
const queueService = require("./src/services/queueService");

const app = express();
const port = 3000;

const { httpCodes } = constants;

// Apply middleware
app.use(cors());
app.use(express.json());

// Router
app.get("/posts", authRequired, async (req, res) => {
    const [posts] = await db.query(`select * from posts`);
    res.json(posts);
});

app.get("/posts/:id", async (req, res) => {
    const [posts] = await db.query(
        `select * from posts where id = ${req.params.id};`,
    );
    const post = posts[0];

    if (!post) {
        return res.status(httpCodes.notFound).json({
            message: "Resource not found.",
        });
    }

    res.json(post);
});

app.post("/auth/register", async (req, res) => {
    const email = req.body.email;

    const password = await bcrypt.hash(
        req.body.password,
        authConfig.saltRounds,
    );

    const [{ insertId }] = await db.query(
        `insert into users (email, password) values (?, ?)`,
        [email, password],
    );

    const newUser = {
        id: insertId,
        email,
    };

    await queueService.push("sendVerificationEmail", newUser);

    res.json({
        data: newUser,
    });
});

app.get("/auth/me", authRequired, async (req, res) => {
    const user = { ...req.auth.user };
    delete user.password;

    res.json({
        data: user,
    });
});

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;

    const [users] = await db.query(
        `select id, password, email_verified_at from users where email = ?`,
        [email],
    );
    const user = users[0];

    if (!user) {
        return res.status(httpCodes.unauthorized).json({
            message: "Resource not found.",
        });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
        if (!user.email_verified_at) {
            return res.status(httpCodes.forbidden).json({
                message: "Vui long xac thuc tai khoan",
            });
        }

        const accessToken = await authService.signAccessToken(user);
        const refreshToken = await authService.createRefreshToken(
            user,
            req.headers["user-agent"],
        );

        return res.json({
            data: {
                access_token: accessToken,
                refresh_token: refreshToken,
            },
        });
    }

    return res.status(httpCodes.unauthorized).json({
        message: "Unauthorized.",
    });
});

app.post("/auth/logout", authRequired, async (req, res) => {
    const { accessToken, tokenPayload } = req.auth;
    const query = `insert into revoked_tokens (token, expires_at) values (?, ?)`;
    await db.query(query, [accessToken, new Date(tokenPayload.exp * 1000)]);

    res.status(204).send();
});

app.post("/auth/refresh-token", async (req, res) => {
    const { refresh_token } = req.body;

    const [tokens] = await db.query(
        "select id, user_id from refresh_tokens where token = ? and expires_at >= now() and is_revoked = 0 limit 1",
        [refresh_token],
    );

    const refreshTokenDB = tokens[0];

    if (!refreshTokenDB) {
        return res.status(401).json({
            message: "Unauthorized.",
        });
    }

    const user = {
        id: refreshTokenDB.user_id,
    };

    // Create new access & refresh token
    const accessToken = await authService.signAccessToken(user);
    const refreshToken = await authService.createRefreshToken(
        user,
        req.headers["user-agent"],
    );

    // Revoke old refresh token
    await db.query("update refresh_tokens set is_revoked = 1 where id = ?", [
        refreshTokenDB.id,
    ]);

    return res.json({
        data: {
            access_token: accessToken,
            refresh_token: refreshToken,
        },
    });
});

app.post("/auth/verify-email", async (req, res) => {
    const { token } = req.body;
    const [error, data] = await authService.verifyEmail(token);

    if (error) {
        return res.status(403).json({
            message: "Invalid token.",
        });
    }

    res.json({
        message: "Verified.",
    });
});

app.post("/auth/change-password", authRequired, async (req, res) => {
    const { password, new_password } = req.body;

    const [error] = await authService.changePassword(
        req.auth.user,
        password,
        new_password,
    );
    if (error) {
        return res.status(httpCodes.unprocessableEntity).json({
            message: error,
        });
    }
    res.json({
        message: "Doi mat khau thanh cong.",
    });
});

app.use(errorHandle);

app.listen(port, () => {
    console.log(`Demo app listening on port ${port}`);
});
