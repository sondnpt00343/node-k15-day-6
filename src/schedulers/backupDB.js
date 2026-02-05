const { exec: childExec } = require("node:child_process");
const { promisify } = require("node:util");

const dbConfig = require("../configs/db.config");
const { getDateStringYmdHis } = require("../utils/time");

const exec = promisify(childExec);

async function backupDB() {
    const { host, user, password, database, port } = dbConfig;
    const dateString = getDateStringYmdHis();
    const { backupLocalDir, backupRemote, backupRemoteDir } = dbConfig;
    const backupCmd = `mysqldump -u${user} -p${password} -h${host} -P${port} ${database} > ${backupLocalDir}/${database}_${dateString}.sql`;

    try {
        // Backup DB
        await exec(backupCmd);
        console.log("Backup DB successfully!");

        // Copy to Drive
        const copyCmd = `rclone copy ${backupLocalDir} ${backupRemote}:${backupRemoteDir}`;
        await exec(copyCmd);

        console.log("Upload to Google Drive successfully!");

        // Send email
        // ...
    } catch (error) {
        console.log(error);
    }
}

module.exports = backupDB;
