import BaseRoutes from "../../base_classes/base-routes.js";
import AttendanceController from "./attendance-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import uploadFile from "../../middlewares/upload-file-middleware.js";
import { attendanceCreateSchema } from "./attendance-schema.js";

class AttendanceRoutes extends BaseRoutes {
    routes() {

        this.router.get("/today", [
            authTokenMiddleware.authenticate,
            tryCatch(AttendanceController.today)
        ]);

        this.router.get("/", [
            authTokenMiddleware.authenticate,
            tryCatch(AttendanceController.list)
        ]);

        this.router.get("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(AttendanceController.detail)
        ]);

        this.router.post("/", [
            authTokenMiddleware.authenticate,
            uploadFile("image").single("photo"),
            validateCredentials(attendanceCreateSchema),
            tryCatch(AttendanceController.create)
        ]);
    }
}

export default new AttendanceRoutes().router;