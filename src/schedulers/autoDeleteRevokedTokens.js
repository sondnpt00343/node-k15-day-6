const prisma = require("@/libs/prisma");

async function autoDeleteRevokedTokens() {
    const result = await prisma.revokedToken.deleteMany({
        where: {
            expires_at: { lt: new Date() },
        },
    });
    console.log(`Da xoa ${result.count} token het han.`);
}

module.exports = autoDeleteRevokedTokens;
