const userService = require("@/services/user.service");

const getAll = async (req, res) => {
    const users = await userService.getAll();
    res.success(users);
};

const getDetail = async (req, res) => {
    const user = await userService.getDetail(req.params.id);
    res.success(user);
};

module.exports = { getAll, getDetail };
