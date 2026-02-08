const postService = require("../services/post.service");
const { postTransformer } = require("../transformers");

const getAll = async (req, res) => {
    const posts = await postService.getAll();
    const response = postTransformer.transform(posts);
    res.json(response);
};

const getDetail = async (req, res) => {
    const post = await postService.getDetail(req.params.id);
    res.json(post);
};

module.exports = { getAll, getDetail };
