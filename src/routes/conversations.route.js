const express = require("express");
const router = express.Router();
const conversationController = require("@/controllers/conversation.controller");
const authRequired = require("@/middlewares/authRequired");

router.post("/", authRequired, conversationController.create);
router.get("/:id/messages", authRequired, conversationController.getMessages);
router.post("/:id/messages", authRequired, conversationController.createMessage);

module.exports = router;
