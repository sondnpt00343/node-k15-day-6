const express = require("express");
const router = express.Router();
const authRequired = require("@/middlewares/authRequired");
const chatbotMessageController = require("@/controllers/chatbotMessage.controller");

router.use(authRequired);

router.get("/", chatbotMessageController.getMessages);
router.post("/chat", chatbotMessageController.chat);

module.exports = router;
