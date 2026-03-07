const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    backupLocalDir: process.env.DB_BACKUP_LOCAL_DIR,
    backupRemote: process.env.DB_BACKUP_REMOTE,
    backupRemoteDir: process.env.DB_BACKUP_REMOTE_DIR,
};

function getDatabaseUrl() {
    const { host, user, password, database, port } = dbConfig;
    const encodedPassword = encodeURIComponent(password || "");
    return `mysql://${user}:${encodedPassword}@${host}:${port}/${database}`;
}

module.exports = dbConfig;
module.exports.getDatabaseUrl = getDatabaseUrl;
