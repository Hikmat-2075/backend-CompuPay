import BaseRoutes from "../../base_classes/base-routes.js";
import LeaverequestController from "./leaveRequest-controller.js";
import {
    leaveRequestCreateSchema,
    leaveRequestUpdateSchema,
} from "./leaveRequest-schema.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

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
            validateCredentials(leaveRequestCreateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(LeaverequestController.create),
        ]);
        this.router.put("/:id", [
            validateCredentials(leaveRequestUpdateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(LeaverequestController.update),
        ]);
        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(LeaverequestController.remove),
        ]);
    }
}

export default new LeaverequestRoutes().router;