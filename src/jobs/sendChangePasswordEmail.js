const mailService = require("@/services/mail.service");

async function sendChangePasswordEmail(payload) {
    await mailService.sendChangePasswordEmail(payload);
}

module.exports = sendChangePasswordEmail;
