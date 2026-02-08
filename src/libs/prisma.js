const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const { PrismaClient } = require("../../generated/prisma");
const dbConfig = require("../configs/db.config");

const adapter = new PrismaMariaDb({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port,
});

async function updatePostsCount(userId) {
    const postsCount = await prisma.post.count({
        where: {
            user_id: userId,
        },
    });
    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            posts_count: postsCount,
        },
    });
}

const prisma = new PrismaClient({ adapter }).$extends({
    query: {
        post: {
            async create({ model, operation, args, query }) {
                const result = await query(args);
                await updatePostsCount(result.user_id);
                return result;
            },
            async delete({ model, operation, args, query }) {
                const result = await query(args);
                await updatePostsCount(result.user_id);
                return result;
            },
        },
    },
});

module.exports = prisma;
