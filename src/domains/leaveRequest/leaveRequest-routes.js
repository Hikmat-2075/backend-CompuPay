import BaseRoutes from "../../base_classes/base-routes.js";
import LeaverequestController from "./leaveRequest-controller.js";
import {
    leaveRequestCreateSchema,
    leaveRequestUpdateSchema,
} from "./leaveRequest-schema.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import uploadFile from "../../middlewares/upload-file-middleware.js";

class LeaverequestRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [
            authTokenMiddleware.authenticate,
            tryCatch(LeaverequestController.list),
        ]);
        this.router.get("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(LeaverequestController.detail),
        ]);
        this.router.post("/", [
            authTokenMiddleware.authenticate,
            uploadFile("all").single("attachment"),
            validateCredentials(leaveRequestCreateSchema),
            tryCatch(LeaverequestController.create),
        ]);
        this.router.put("/:id", [
            authTokenMiddleware.authenticate,
            uploadFile("all").single("attachment"),
            validateCredentials(leaveRequestUpdateSchema),
            tryCatch(LeaverequestController.update),
        ]);
        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(LeaverequestController.remove),
        ]);
    }
}

export default new LeaverequestRoutes().router;