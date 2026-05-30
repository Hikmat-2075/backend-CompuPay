import BaseRoutes from "../../base_classes/base-routes.js";
import AttendanceController from "./attendance-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import uploadFile from "../../middlewares/upload-file-middleware.js";
import { attendanceCreateSchema } from "./attendance-schema.js";

class AttendanceRoutes extends BaseRoutes {
	routes() {
		this.router.post("/check-in", [
			authTokenMiddleware.authenticate,
			uploadFile("image").single("photo"),
			validateCredentials(attendanceCreateSchema),
			tryCatch(AttendanceController.checkIn),
		]);

		this.router.post("/check-out", [
			authTokenMiddleware.authenticate,
			uploadFile("image").single("photo"),
			validateCredentials(attendanceCreateSchema),
			tryCatch(AttendanceController.checkOut),
		]);

		this.router.get("/config", [
			authTokenMiddleware.authenticate,
			tryCatch(AttendanceController.getConfig),
		]);

		this.router.get("/today", [
			authTokenMiddleware.authenticate,
			tryCatch(AttendanceController.today),
		]);

		this.router.get("/", [
			authTokenMiddleware.authenticate,
			tryCatch(AttendanceController.list),
		]);

		this.router.get("/:id", [
			authTokenMiddleware.authenticate,
			tryCatch(AttendanceController.detail),
		]);
	}
}

export default new AttendanceRoutes().router;
