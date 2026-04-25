import nodemailer from "nodemailer";
import mailerConfig from "../../config/mailer.config.js";
import logger from "../../utils/logger.js";

class MailerService {
	constructor() {
		const config = mailerConfig();
		this.transporter = nodemailer.createTransport({
			host: config.MAILER_HOST,
			port: config.MAILER_PORT,
			secure: config.MAILER_SECURE, // true for 465, false for other ports
			auth: {
				user: config.MAILER_USER,
				pass: config.MAILER_PASSWORD,
			},
			tls: {
				rejectUnauthorized: config.MAILER_TLS_REJECT_UNAUTHORIZED,
			},
		});
	}

	async sendMail(options) {
		try {
			const mailOptions = {
				from: `"${options.fromName}" <${options.from}>`, // sender address
				to: options.to, // list of receivers
				subject: options.subject, // Subject line
				text: options.text, // plain text body
				html: options.html, // html body
			};
			const info = await this.transporter.sendMail(mailOptions);
			logger.info("Message sent: %s", info.messageId);
			return info;
		} catch (error) {
			logger.error("Error sending email: ", error);
		}
	}
}

export default MailerService;
