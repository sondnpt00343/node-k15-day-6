const nodemailer = require("nodemailer");
const mailConfig = require("../configs/mail.config");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: mailConfig.fromAddress,
        pass: mailConfig.appPassword,
    },
});

module.exports = { transporter };
