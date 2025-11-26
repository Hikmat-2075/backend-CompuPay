import BaseRoutes from "../../base_classes/base-routes.js";
import DepartmentController from "./department-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import {
    departmentCreateSchema,
    departmentUpdateSchema,
} from "./department-schema.js"
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class DepartmentRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [
            authTokenMiddleware.authenticate,
            tryCatch(DepartmentController.list),
        ]);
        this.router.get("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(DepartmentController.detail),
        ]);
        this.router.post("/", [
            validateCredentials(departmentCreateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(DepartmentController.create),
        ]);
        this.router.put("/:id", [
            validateCredentials(departmentUpdateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(DepartmentController.update),
        ]);
        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(DepartmentController.delete),
        ]);
    }
}

export default new DepartmentRoutes().router;