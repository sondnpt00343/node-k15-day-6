require("module-alias/register");
require("dotenv").config();
const { CronJob } = require("cron");

const backupDB = require("@/schedulers/backupDB");
const autoDeleteRevokedTokens = require("@/schedulers/autoDeleteRevokedTokens");

// Backup DB 02:00
new CronJob("0 2 * * *", backupDB).start();

// Auto delete revoked tokens
new CronJob("0 1 * * *", autoDeleteRevokedTokens).start();
