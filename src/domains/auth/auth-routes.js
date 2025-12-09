import BaseRoutes from "../../base_classes/base-routes.js";
import AuthController from "./auth-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import {
	registerSchema,
	loginSchema,
	sendOtpSchema,
	forgetPasswordSchema,
	resetPasswordSchema,
	verifyOtpSchema
} from "./auth-schema.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class AuthRoutes extends BaseRoutes {
	routes() {
		this.router.post("/send-otp", [
			validateCredentials(sendOtpSchema),
			tryCatch(AuthController.sendOtp),
		]);

		this.router.post("/register", [
			validateCredentials(registerSchema),
			tryCatch(AuthController.register),
		]);

		this.router.post("/login", [
			validateCredentials(loginSchema),
			tryCatch(AuthController.login),
		]);

		this.router.post("/refresh", [tryCatch(AuthController.refreshToken)]);

		this.router.get("/me", [
			authTokenMiddleware.authenticate,
			tryCatch(AuthController.getProfile),
		]);
		
		this.router.post("/forget-password", [
			validateCredentials(forgetPasswordSchema),
			tryCatch(AuthController.forgetPassword),
		]);

		this.router.post("/verify-otp", [
			validateCredentials(verifyOtpSchema),
			tryCatch(AuthController.verifyOtp),
		]);

		this.router.post("/reset-password", [
			validateCredentials(resetPasswordSchema),
			tryCatch(AuthController.resetPassword),
		]);
	}
}

export default new AuthRoutes().router;
