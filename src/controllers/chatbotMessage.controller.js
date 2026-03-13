const chatbotMessageService = require("@/services/chatbotMessage.service");
const { chatRole } = require("@/configs/constants");

const getMessages = async (req, res) => {
    const user = req.auth.user;
    const { before, limit } = req.query;

    const result = await chatbotMessageService.getMessages(user, {
        before: before ? parseInt(before) : null,
        limit: limit ? parseInt(limit) : 20,
    });

    res.success(result);
};

const chat = async (req, res) => {
    const input = typeof req.body?.input === "string" ? req.body.input.trim() : "";
    if (!input) return res.error("Invalid input", 400);

    const user = req.auth.user;
    const result = await chatbotMessageService.chat(user, input);

    res.success({
        role: chatRole.assistant,
        content: result,
    });
};

module.exports = {
    getMessages,
    chat,
};
