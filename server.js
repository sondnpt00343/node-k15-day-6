require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");

const errorHandle = require("./src/middlewares/errorHandle");
const db = require("./db");
const authService = require("./src/services/authService");
const authRequired = require("./src/middlewares/authRequired");
const authConfig = require("./src/configs/auth.config");
const constants = require("./src/configs/constants");
const app = express();
const port = 3000;

const { httpCodes } = constants;

app.use(express.json());

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
    
    res.json({
        data: newUser,
    });
});

app.get("/auth/me", authRequired, async (req, res) => {
    res.json({
        data: req.currentUser,
    });
});

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    
    const [users] = await db.query(
        `select id, password from users where email = ?`,
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
        const accessToken = await authService.signAccessToken(user);

        return res.json({
            data: {
                access_token: accessToken,
            },
        });
    }

    return res.status(httpCodes.unauthorized).json({
        message: "Unauthorized.",
    });
});

app.use(errorHandle);

app.listen(port, () => {
    console.log(`Demo app listening on port ${port}`);
});
