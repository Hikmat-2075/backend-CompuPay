import BaseRoutes from "../../base_classes/base-routes.js";
import PositionController from "./position-controller.js";
import {
    positionCreateSchema,
    positionUpdateSchema,
} from "./position-schema.js"

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class PositionRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [
            authTokenMiddleware.authenticate,
            tryCatch(PositionController.list),
        ]);
        this.router.get("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(PositionController.detial),
        ]);
        this.router.post("/", [
            validateCredentials(positionCreateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(PositionController.create),
        ]);
        this.router.put("/:id", [
            validateCredentials(positionUpdateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(PositionController.update),
        ]);
        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(PositionController.delete),
        ]);
    }
}

export default new PositionRoutes().router;