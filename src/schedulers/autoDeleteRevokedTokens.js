const db = require("../../db");

async function autoDeleteRevokedTokens() {
    const [{ affectedRows }] = await db.query(
        "delete from revoked_tokens where expires_at < now()",
    );
    console.log(`Da xoa ${affectedRows} token het han.`);
}

module.exports = autoDeleteRevokedTokens;
