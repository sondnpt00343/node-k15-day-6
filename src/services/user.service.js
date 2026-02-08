const prisma = require("../libs/prisma");

class UserService {
    async getAll() {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                score: true,
                posts_count: true,
                email_verified_at: true,
                created_at: true,
            },
        });
        return users;
    }
}

module.exports = new UserService();
