const prisma = require("../libs/prisma");

class PostService {
    async getAll() {
        const posts = await prisma.post.findMany();
        return posts;
    }

    async getDetail(id) {
        const post = await prisma.post.findUniqueOrThrow({
            select: {
                id: true,
                title: true,
                content: true,
                created_at: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                comments: {
                    select: {
                        id: true,
                        content: true,
                        created_at: true,
                        updated_at: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            where: {
                id: parseInt(id),
            },
        });
        return post;
    }
}

module.exports = new PostService();
