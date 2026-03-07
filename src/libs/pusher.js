const Pusher = require("pusher");

const pusher = new Pusher({
    appId: process.env.SOKETI_APP_ID,
    key: process.env.SOKETI_APP_KEY,
    secret: process.env.SOKETI_APP_SECRET,
    cluster: "",
    useTLS: false,
    host: "127.0.0.1",
    port: "6002",
});

module.exports = pusher;
