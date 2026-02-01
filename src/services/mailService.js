const ejs = require("ejs");
const path = require("node:path");

const mailConfig = require("../configs/mail.config");
const { transporter } = require("../libs/nodemailer");
const authService = require("./authService");

class MailService {
    getTemplatePath(template) {
        const templatePath = path.join(
            __dirname,
            "..",
            "resource",
            "mail",
            `${template.replace(".ejs", "")}.ejs`,
        );
        return templatePath;
    }

    async send(options) {
        const { template, templateData, ...restOptions } = options;
        const templatePath = this.getTemplatePath(template);
        const html = await ejs.renderFile(templatePath, templateData);
        const result = await transporter.sendMail({ ...restOptions, html });

        return result;
    }

    // Send verification email
    async sendVerificationEmail(user) {
        const { fromAddress, fromName } = mailConfig;
        const verificationLink = authService.generateVerificationLink(user);

        const result = await this.send({
            from: `"${fromName}" <${fromAddress}>`,
            to: user.email,
            subject: "Verification",
            template: "auth/verificationEmail",
            templateData: {
                verificationLink,
            },
        });

        return result;
    }

    // Send password change email
    async sendChangePasswordEmail(user) {
        const { fromAddress, fromName } = mailConfig;

        const result = await this.send({
            from: `"${fromName}" <${fromAddress}>`,
            to: user.email,
            subject: "Thông báo đổi mật khẩu",
            template: "auth/changePassword",
            templateData: {
                changeTime: new Date().toLocaleString(),
                supportLink: "https://f8.edu.vn/ho-tro",
            },
        });

        return result;
    }
}

module.exports = new MailService();
