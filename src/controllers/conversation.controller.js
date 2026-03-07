const conversationService = require("@/services/conversation.service");
const { http } = require("@/configs/constants");

const create = async (req, res) => {
    const { name, type, user_ids } = req.body;
    const userIds = [req.auth.user.id, ...(user_ids || [])];

    const conversation = await conversationService.create(name, type, userIds);

    res.success(conversation, http.created);
};

const getMessages = async (req, res) => {
    const id = parseInt(req.params.id);
    const messages = await conversationService.getMessages(id);

    res.success(messages);
};

const createMessage = async (req, res) => {
    const { type, content } = req.body;
    const id = parseInt(req.params.id);

    const message = await conversationService.createMessage(
        id,
        req.auth.user.id,
        type,
        content
    );

    res.success(message, http.created);
};

module.exports = {
    create,
    getMessages,
    createMessage,
};
