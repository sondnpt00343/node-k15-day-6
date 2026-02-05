require("dotenv").config();
const { CronJob } = require("cron");

const backupDB = require("./src/schedulers/backupDB");
const autoDeleteRevokedTokens = require("./src/schedulers/autoDeleteRevokedTokens");

// Backup DB 02:00
new CronJob("0 2 * * *", backupDB).start();

// Auto delete revoked tokens
new CronJob("0 1 * * *", autoDeleteRevokedTokens).start();
