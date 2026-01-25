const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jwt");

const db = require("./db");
const app = express();
const port = 3000;

const saltRounds = 10;

app.use(express.json());

app.get("/posts", async (req, res) => {
    const [posts] = await db.query(`select * from posts`);
    res.json(posts);
});

app.get("/posts/:id", async (req, res) => {
    const [posts] = await db.query(
        `select * from posts where id = ${req.params.id};`,
    );
    const post = posts[0];
    if (!post) {
        return res.status(404).json({
            message: "Resource not found.",
        });
    }

    res.json(post);
});

app.post("/auth/register", async (req, res) => {
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password, saltRounds);

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

// JWT - JSON Web Token
// Stateful ❌
// Stateless ✅

// Authentication: Xác thực người dùng (Xác thực thông tin đăng nhập - credentials)
// Authorization: Ủy quyền (Kiểm tra xem có quyền hay không)

app.get("/auth/me", async (req, res) => {
    const token = req.query.token;
    const userId = tokens[token];
    if (!userId) {
        return res.status(401).json({
            message: "Resource not found.",
        });
    }
    const [users] = await db.query(
        "select id, email, created_at from users where id = ?",
        [userId],
    );
    const user = users[0];
    if (!user) {
        return res.status(401).json({
            message: "Not found.",
        });
    }
    res.json({
        data: user,
    });
});

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const [users] = await db.query(
        `select password from users where email = ?`,
        [email],
    );
    const user = users[0];
    if (!user) {
        return res.status(401).json({
            message: "Resource not found.",
        });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
        return res.json({
            data: "<your-token></your-token>",
        });
    }

    return res.status(401).json({
        message: "Unauthorized.",
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
