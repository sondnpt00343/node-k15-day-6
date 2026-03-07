const postService = require("@/services/post.service");

const getAll = async (req, res) => {
    const posts = await postService.getAll();
    res.success(posts);
};

const getDetail = async (req, res) => {
    const post = await postService.getDetail(req.params.id);
    res.success(post);
};

module.exports = { getAll, getDetail };
