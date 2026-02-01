const mailService = require("../services/mailService");

async function sendVerificationEmail(payload) {
    await mailService.sendVerificationEmail(payload);
}

module.exports = sendVerificationEmail;
