import BaseRoutes from "../../base_classes/base-routes.js";
import AttendanceController from "./attendance-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';

class AttendanceRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [tryCatch(AttendanceController.index)]);
        this.router.get("/:id", [tryCatch(AttendanceController.show)]);
        this.router.post("/", [tryCatch(AttendanceController.create)]);
        this.router.put("/:id", [tryCatch(AttendanceController.update)]);
        this.router.delete("/:id", [tryCatch(AttendanceController.delete)]);
    }
}

export default new AttendanceRoutes().router;