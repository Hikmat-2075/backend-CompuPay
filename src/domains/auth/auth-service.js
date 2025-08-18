import BaseError from "../../base_classes/base-error.js";

import joi from "joi";
import { parseJWT, generateToken } from "../../utils/jwtTokenConfig.js";
import { matchPassword, hashPassword } from "../../utils/passwordConfig.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import MailerService from "../../common/services/mailer.service.js";
import logger from "../../utils/logger.js";

class AuthService {
	constructor() {
		this.prisma = new PrismaService();
		this.mailer = new MailerService();
		this.OTP_EXPIRES_IN = process.env.OTP_EXPIRES_IN || "5m";
	}

	async login(email, password) {
		let user = await this.prisma.user.findFirst({
			where: {
				email: email,
			},
		});

		if (!user) {
			throw BaseError.badRequest("Invalid credentials");
		}

		const isMatch = await matchPassword(password, user.password);

		if (!isMatch) {
			throw BaseError.badRequest("Invalid credentials");
		}

		delete user.password;

		const accessToken = generateToken({ id: user.id, type: "access" }, "1d");
		const refreshToken = generateToken(
			{ id: user.id, type: "refresh" },
			"365d",
		);

		return { access_token: accessToken, refresh_token: refreshToken, user };
	}

	async register(data) {
		const emailExist = await this.prisma.user.findFirst({
			where: {
				email: data.email,
			},
		});

		if (emailExist) {
			let validation = "";
			let stack = [];

			validation += "Email already taken.";

			stack.push({
				message: "Email already taken.",
				path: ["email"],
			});

			throw new joi.ValidationError(validation, stack);
		}

		const otpExist = await this.prisma.otp.findFirst({
			where: {
				email: data.email,
				otp: data.otp_verification,
			},
		});

		if (!otpExist) {
			let validation = "";
			let stack = [];

			validation += "Invalid OTP.";

			stack.push({
				message: "Invalid OTP.",
				path: ["otp_verification"],
			});

			throw new joi.ValidationError(validation, stack);
		}

		if (otpExist.expired_at < new Date()) {
			let validation = "";
			let stack = [];

			validation += "OTP expired.";

			stack.push({
				message: "OTP expired.",
				path: ["otp_verification"],
			});

			throw new joi.ValidationError(validation, stack);
		}

		await this.prisma.$transaction(async (tx) => {
			await tx.otp.delete({
				where: {
					id: otpExist.id,
				},
			});

			const createduser = await tx.user.create({
				data: {
					email: data.email,
					password: await hashPassword(data.password),
				},
			});

			if (!createduser) {
				throw Error("Failed to register");
			}
		});

		return {
			message: "Registration successful",
		};
	}

	async refreshToken(refreshToken) {
		if (!refreshToken) {
			logger.error("Refresh token not provided");
			throw BaseError.unauthorized("Refresh token not found");
		}

		const decoded = parseJWT(refreshToken);

		if (!decoded || decoded.type !== "refresh") {
			logger.error("Invalid refresh token");
			throw BaseError.unauthorized("Invalid refresh token");
		}

		const user = await this.prisma.user.findFirst({
			where: {
				id: decoded.id,
			},
		});

		if (!user) {
			logger.error("user not found for refresh token ID:", decoded.id);
			throw BaseError.unauthorized("user not found");
		}

		const newAccessToken = generateToken(
			{
				id: user.id,
				from: "KC",
				type: "access",
			},
			"1d",
		);

		return { access_token: newAccessToken };
	}

	async sendOtp(email) {
		const otp = await this.prisma.$transaction(async (tx) => {
			const userExists = await tx.user.findFirst({
				where: { email },
			});

			if (userExists) {
				throw BaseError.badRequest("Email already registered");
			}

			// 5 digit OTP
			const otp = Math.floor(10000 + Math.random() * 90000).toString();

			const expiredAt = new Date(
				Date.now() + this._parseExpiry(this.OTP_EXPIRES_IN),
			);

			await tx.otp.create({
				data: {
					email,
					otp,
					expired_at: expiredAt,
				},
			});

			return otp;
		});

		this.mailer
			.sendMail({
				to: email,
				subject: "Your OTP Code",
				text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
			})
			.then(() => {
				logger.info(`OTP sent to ${email}`);
			})
			.catch((error) => {
				logger.error(`Failed to send OTP to ${email}:`, error);
			});

		return otp;
	}

	_parseExpiry(duration) {
		const match = duration.match(/^(\d+)([smhd])$/); // cocokkan angka + 1 huruf (s/m/h/d)
		if (!match) throw new Error("Invalid OTP_EXPIRES_IN format");

		const value = parseInt(match[1]);
		const user = match[2];

		const multipliers = {
			s: 1000,
			m: 60 * 1000,
			h: 60 * 60 * 1000,
			d: 24 * 60 * 60 * 1000,
		};

		return value * multipliers[user];
	}
}

export default new AuthService();
