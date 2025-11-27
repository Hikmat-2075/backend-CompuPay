import BaseRoutes from "../../base_classes/base-routes.js";
import DeductionsController from "./deductions-controller.js";
import {
    deductionsCreateSchema,
    deductionsUpdateSchema,
} from "./deductions-schema.js";
import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class DeductionsRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [
            authTokenMiddleware.authenticate,
            tryCatch(DeductionsController.list),
        ]);
        this.router.get("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(DeductionsController.detail),
        ]);
        this.router.post("/", [
            validateCredentials(deductionsCreateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(DeductionsController.create),
        ]);
        this.router.put("/:id", [
            validateCredentials(deductionsUpdateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(DeductionsController.update),
        ]);
        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(DeductionsController.remove),
        ]);
    }
}

export default new DeductionsRoutes().router;