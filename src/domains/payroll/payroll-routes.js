import BaseRoutes from "../../base_classes/base-routes.js";
import PayrollController from "./payroll-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import { payrollCreateSchema, payrollUpdateSchema } from "./payroll-schema.js";

class PayrollRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [
            authTokenMiddleware.authenticate,
            tryCatch(PayrollController.list)
        ]);

        this.router.get("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(PayrollController.detail)
        ]);

        this.router.post("/", [
            validateCredentials(payrollCreateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(PayrollController.create)
        ]);

        this.router.put("/:id", [
            validateCredentials(payrollUpdateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(PayrollController.update) 
        ]);

        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(PayrollController.remove)
        ]);

        this.router.post("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(PayrollController.pay)
        ])
    }
}

export default new PayrollRoutes().router;