import BaseRoutes from "../../base_classes/base-routes.js";
import AuthController from "./auth-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import {
	registerSchema,
	loginSchema,
	sendOtpSchema,
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
	}
}

export default new AuthRoutes().router;
