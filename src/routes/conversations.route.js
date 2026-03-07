const express = require("express");
const router = express.Router();
const conversationController = require("@/controllers/conversation.controller");
const authRequired = require("@/middlewares/authRequired");
const conversationMember = require("@/middlewares/conversationMember");

router.get("/", authRequired, conversationController.getAll);
router.get("/dm/:userId", authRequired, conversationController.findDm);
router.post("/", authRequired, conversationController.create);
router.get("/:id/messages", authRequired, conversationMember, conversationController.getMessages);
router.post("/:id/messages", authRequired, conversationMember, conversationController.createMessage);

module.exports = router;
