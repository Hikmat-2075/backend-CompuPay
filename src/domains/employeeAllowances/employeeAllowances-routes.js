import BaseRoutes from "../../base_classes/base-routes.js";
import EmployeeallowancesController from "./employeeAllowances-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js"
import {
    employeeAllowancesCreateSchema,
    employeeAllowancesUpdateSchema,
} from "./employeeAllowances-schema.js"

class EmployeeallowancesRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [
            authTokenMiddleware.authenticate,
            tryCatch(EmployeeallowancesController.list)
        ]);
        this.router.get("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(EmployeeallowancesController.detail)
        ]);
        this.router.post("/", [
            validateCredentials(employeeAllowancesCreateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(EmployeeallowancesController.create)
        ]);
        this.router.put("/:id", [
            validateCredentials(employeeAllowancesUpdateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(EmployeeallowancesController.update)
        ]);
        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(EmployeeallowancesController.delete)
        ]);
    }
}

export default new EmployeeallowancesRoutes().router;