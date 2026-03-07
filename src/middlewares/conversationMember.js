const prisma = require("@/libs/prisma");
const { http } = require("@/configs/constants");

async function conversationMember(req, res, next) {
    const conversationId = parseInt(req.params.id);
    const userId = req.auth.user.id;

    const member = await prisma.conversationUser.findFirst({
        where: {
            conversation_id: conversationId,
            user_id: userId,
        },
    });

    if (!member) {
        return res.error("FORBIDDEN", http.forbidden);
    }

    next();
}

module.exports = conversationMember;
