const prisma = require("@/libs/prisma");
const pusher = require("@/libs/pusher");

class ConversationService {
    async create(name, type, userIds) {
        if (type === "dm") {
            const existing = await prisma.conversation.findFirst({
                where: {
                    type: "dm",
                    AND: userIds.map((userId) => ({
                        conversationUsers: {
                            some: { user_id: userId },
                        },
                    })),
                    conversationUsers: {
                        every: {
                            user_id: { in: userIds },
                        },
                    },
                },
                include: {
                    conversationUsers: true,
                },
            });

            if (
                existing &&
                existing.conversationUsers.length === userIds.length
            ) {
                return existing;
            }
        }

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

        // Fetch đầy đủ để gửi qua websocket (format giống getConversations)
        const fullConversation = await prisma.conversation.findUnique({
            where: { id: conversation.id },
            include: {
                messages: {
                    orderBy: { created_at: "desc" },
                    take: 1,
                },
                conversationUsers: {
                    include: {
                        user: {
                            select: { id: true, email: true, name: true },
                        },
                    },
                },
            },
        });

        // Thông báo cho tất cả thành viên về conversation mới
        for (const userId of userIds) {
            pusher.trigger(`user-${userId}`, "conversation.created", fullConversation);
        }

        return conversation;
    }

    async findDm(userId, otherUserId) {
        const userIds = [userId, otherUserId];
        const existing = await prisma.conversation.findFirst({
            where: {
                type: "dm",
                AND: userIds.map((uid) => ({
                    conversationUsers: { some: { user_id: uid } },
                })),
                conversationUsers: {
                    every: { user_id: { in: userIds } },
                },
            },
            include: { conversationUsers: true },
        });

        if (existing && existing.conversationUsers.length === userIds.length) {
            return existing;
        }
        return null;
    }

    async getConversations(userId) {
        const conversations = await prisma.conversation.findMany({
            where: {
                conversationUsers: {
                    some: { user_id: userId },
                },
            },
            include: {
                messages: {
                    orderBy: { created_at: "desc" },
                    take: 1,
                },
                conversationUsers: {
                    where: {
                        user_id: { not: userId },
                    },
                    include: {
                        user: {
                            select: { id: true, email: true, name: true },
                        },
                    },
                },
            },
        });

        return conversations.sort((a, b) => {
            const aTime = a.messages[0]?.created_at ?? new Date(0);
            const bTime = b.messages[0]?.created_at ?? new Date(0);
            return bTime - aTime;
        });
    }

    async getMessages(conversationId, { limit = 20, before } = {}) {
        const where = { conversation_id: conversationId };
        if (before) {
            where.id = { lt: before };
        }

        const messages = await prisma.message.findMany({
            where,
            orderBy: { created_at: "desc" },
            take: limit + 1,
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
            },
        });

        const hasMore = messages.length > limit;
        if (hasMore) messages.pop();

        return {
            messages: messages.reverse(),
            hasMore,
        };
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
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
            },
        });

        pusher.trigger(`conversation-${conversationId}`, "created", message);

        return message;
    }
}

module.exports = new ConversationService();
