const postService = require("../services/post.service");
const userService = require("../services/user.service");
const { userTransformer } = require("../transformers");

const getAll = async (req, res) => {
    const users = await userService.getAll();
    const response = userTransformer.transform(users);

    res.json(response);
};

module.exports = { getAll };
