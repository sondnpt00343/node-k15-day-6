const prisma = require("@/libs/prisma");

class ProductService {
    async getAll() {
        return prisma.product.findMany();
    }
}

module.exports = new ProductService();
