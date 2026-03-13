const ejs = require("ejs");
const path = require("node:path");

const mailConfig = require("@/configs/mail.config");
const { transporter } = require("@/libs/nodemailer");
const authService = require("@/services/auth.service");

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

    async sendVerificationEmail(user) {
        const { appUser, fromName } = mailConfig;
        const verificationLink = authService.generateVerificationLink(user);

        const result = await this.send({
            from: `"${fromName}" <${appUser}>`,
            to: user.email,
            subject: "Verification",
            template: "auth/verificationEmail",
            templateData: {
                verificationLink,
            },
        });

        return result;
    }

    async sendChangePasswordEmail(user) {
        const { appUser, fromName } = mailConfig;

        const result = await this.send({
            from: `"${fromName}" <${appUser}>`,
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
