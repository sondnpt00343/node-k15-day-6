const dbConfig = {
    // DB
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,

    // Backup
    backupLocalDir: process.env.DB_BACKUP_LOCAL_DIR,
    backupRemote: process.env.DB_BACKUP_REMOTE,
    backupRemoteDir: process.env.DB_BACKUP_REMOTE_DIR,
};

module.exports = dbConfig;
