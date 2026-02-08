const postService = require("../services/post.service");
const userService = require("../services/user.service");
const UserTransformer = require("../transformers/UserTransformer");

const getAll = async (req, res) => {
    const users = await userService.getAll();
    const posts = await postService.getPostsGroupByUserId();
    const response = new UserTransformer().transform(users, posts);

    res.json(response);
};

module.exports = { getAll };
