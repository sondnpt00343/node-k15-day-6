const mailConfig = {
    fromName: process.env.MAIL_FROM_NAME,
    fromAddress: process.env.MAIL_FROM_ADDRESS,
    appPassword: process.env.MAIL_APP_PASSWORD,
};

module.exports = mailConfig;
