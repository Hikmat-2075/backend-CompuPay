import BaseRoutes from "../../base_classes/base-routes.js";
import AllowancesController from "./allowances-controller.js";
import {
    allowancesCreateSchema,
    allowancesUpdateSchema,
} from "./allowances-schema.js"

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class AllowancesRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [
            authTokenMiddleware.authenticate,
            tryCatch(AllowancesController.list)
        ]);
        this.router.get("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(AllowancesController.detail)
        ]);
        this.router.post("/", [
            validateCredentials(allowancesCreateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(AllowancesController.create)
        ]);
        this.router.put("/:id", [
            validateCredentials(allowancesUpdateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(AllowancesController.update)

        ]);
        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(AllowancesController.delete)
        ]);
    }
}

export default new AllowancesRoutes().router;