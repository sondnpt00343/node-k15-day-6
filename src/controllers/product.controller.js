const productService = require("@/services/product.service");

const getAll = async (req, res) => {
    const products = await productService.getAll();
    res.success(products);
};

module.exports = { getAll };
