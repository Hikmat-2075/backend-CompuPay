import BaseRoutes from "../../base_classes/base-routes.js";
import AttendanceController from "./attendance-controller.js";
import {
    attendanceCreateSchema,
    attendanceUpdateSchema,
} from "./attendance-schema.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class AttendanceRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [
            authTokenMiddleware.authenticate,
            tryCatch(AttendanceController.list)
        ]);
        this.router.get("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(AttendanceController.detail)
        ]);
        this.router.post("/", [
            validateCredentials(attendanceCreateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(AttendanceController.create)
        ]);
        this.router.put("/:id", [
            validateCredentials(attendanceUpdateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(AttendanceController.update)
        ]);
        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(AttendanceController.delete)
        ]);
    }
}

export default new AttendanceRoutes().router;