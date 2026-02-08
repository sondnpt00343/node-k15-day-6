const prisma = require("../libs/prisma");

class PostService {
    async getPostsGroupByUserId() {
        const posts = await prisma.posts.groupBy({
            by: ["user_id"],
            _count: {
                _all: true,
            },
        });
        return posts;
    }
}

module.exports = new PostService();
