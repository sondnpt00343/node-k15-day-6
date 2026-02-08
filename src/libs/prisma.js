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

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
