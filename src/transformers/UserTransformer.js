class UserTransformer {
    transform(users, posts) {
        const postUser = posts.reduce((result, post) => {
            return {
                ...result,
                [post.user_id]: post,
            };
        }, {});
        const response = users.map((user) => {
            const post = postUser[user.id];
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                score: user.score,
                email_verified_at: user.email_verified_at,
                created_at: user.created_at,
                posts_count: post._count._all,
            };
        });
        return response;
    }
}

module.exports = UserTransformer;
