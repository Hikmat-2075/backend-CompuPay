import BaseRoutes from "../../base_classes/base-routes.js";
import EmployeedeductionsController from "./employeeDeductions-controller.js";
import {
    employeeDeductionsCreateSchema,
    employeeDeductionsUpdateSchema,
} from "./employeeDeductions-schema.js"

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class EmployeedeductionsRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [
            authTokenMiddleware.authenticate,
            tryCatch(EmployeedeductionsController.list)
        ]);
        this.router.get("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(EmployeedeductionsController.detail)
        ]);
        this.router.post("/", [
            validateCredentials(employeeDeductionsCreateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(EmployeedeductionsController.create)
        ]);
        this.router.put("/:id", [
            validateCredentials(employeeDeductionsUpdateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(EmployeedeductionsController.update)
        ]);
        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(EmployeedeductionsController.delete)
        ]);
    }
}

export default new EmployeedeductionsRoutes().router;