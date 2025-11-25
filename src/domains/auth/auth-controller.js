import BaseError from "../../base_classes/base-error.js";
import S3Service from "../../common/services/s3.service.js";
import { successResponse } from "../../utils/response.js";
import AuthService from "./auth-service.js";

class AuthController {

	async login(req, res) {
		const { email, password } = req.body;

		const data = await AuthService.login(email, password);

		res
			.cookie("refresh_token", data.refresh_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
			.header("Authorization", `Bearer ${data.access_token}`);

		return successResponse(res, data, "Login successful");
	}

	async register(req, res) {
		let data = req.body;

		const message = await AuthService.register(data);

		return successResponse(res, message);
	}

	async refreshToken(req, res) {
		const { refresh_token } = req.cookies;

		if (!refresh_token) {
			throw new BaseError.unauthorized("Refresh token not found");
		}

		const token = await AuthService.refreshToken(refresh_token);

		res.header("Authorization", `Bearer ${token.access_token}`);

		return successResponse(res, null, "Token refreshed successfully");
	}

	async getProfile(req, res) {
		if (!req.user) {
			throw Error("Failed to get user profile");
		}

		return successResponse(
			res,
			req.user,
			"User profile retrieved successfully",
		);
	}

	async sendOtp(req, res) {
		const { email } = req.body;

		const otp = await AuthService.sendOtp(email);

		return successResponse(res, null, "OTP sent successfully");
	}
}

export default new AuthController();
