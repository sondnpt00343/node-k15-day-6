const mailService = require("../services/mailService");

async function sendChangePasswordEmail(payload) {
    await mailService.sendChangePasswordEmail(payload);
}

module.exports = sendChangePasswordEmail;
