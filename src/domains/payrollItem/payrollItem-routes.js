import BaseRoutes from "../../base_classes/base-routes.js";
import PayrollitemController from "./payrollItem-controller.js";
import {
    payrollItemCreateSchema,
    payrollItemUpdateSchema,
} from "./payrollItem-schema.js"

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class PayrollitemRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [
            authTokenMiddleware.authenticate,
            tryCatch(PayrollitemController.list)
        ]);
        this.router.get("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(PayrollitemController.detail)
        ]);
        this.router.post("/", [
            validateCredentials(payrollItemCreateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(PayrollitemController.create)
        ]);
        this.router.put("/:id", [
            validateCredentials(payrollItemUpdateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(PayrollitemController.update)
        ]);
        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(PayrollitemController.remove)
        ]);
    }
}

export default new PayrollitemRoutes().router;