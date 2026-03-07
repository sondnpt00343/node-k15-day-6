const conversationService = require("@/services/conversation.service");
const { http } = require("@/configs/constants");

const findDm = async (req, res) => {
    const otherUserId = parseInt(req.params.userId);
    const conversation = await conversationService.findDm(req.auth.user.id, otherUserId);

    if (!conversation) {
        return res.error("NOT_FOUND", http.notFound);
    }

    res.success(conversation);
};

const getAll = async (req, res) => {
    const conversations = await conversationService.getConversations(req.auth.user.id);
    res.success(conversations);
};

const create = async (req, res) => {
    const { name, type, user_ids } = req.body;
    const userIds = [req.auth.user.id, ...(user_ids || [])];

    const conversation = await conversationService.create(name, type, userIds);

    res.success(conversation, http.created);
};

const getMessages = async (req, res) => {
    const id = parseInt(req.params.id);
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const before = req.query.before ? parseInt(req.query.before) : undefined;

    const result = await conversationService.getMessages(id, { limit, before });

    res.success(result);
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
    findDm,
    getAll,
    create,
    getMessages,
    createMessage,
};
