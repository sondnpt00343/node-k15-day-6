const prisma = require("@/libs/prisma");
const pusher = require("@/libs/pusher");

class ConversationService {
    async create(name, type, userIds) {
        const conversation = await prisma.conversation.create({
            data: {
                name: name || null,
                type,
            },
        });

        for (const userId of userIds) {
            await prisma.conversationUser.create({
                data: {
                    conversation_id: conversation.id,
                    user_id: userId,
                },
            });
        }

        return conversation;
    }

    async getMessages(conversationId) {
        return prisma.message.findMany({
            where: {
                conversation_id: conversationId,
            },
            orderBy: {
                created_at: "asc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
    }

    async createMessage(conversationId, userId, type, content) {
        await prisma.conversation.findUniqueOrThrow({
            where: { id: conversationId },
        });

        const message = await prisma.message.create({
            data: {
                user_id: userId,
                conversation_id: conversationId,
                type: type || "text",
                content,
            },
        });

        pusher.trigger(`conversation-${conversationId}`, "created", message);

        return message;
    }
}

module.exports = new ConversationService();
