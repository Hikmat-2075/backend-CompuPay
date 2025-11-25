import BaseRoutes from "../../base_classes/base-routes.js";
import UserController from "./user-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import {
    userCreateSchema,
    userUpdateSchema,
} from "./user-schema.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class UserRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [
            authTokenMiddleware.authenticate,
            tryCatch(UserController.list),
        ]);
        this.router.get("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(UserController.detail),
        ]);
        this.router.post("/", [
            validateCredentials(userCreateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(UserController.create),
        ]);
        this.router.put("/:id", [
            validateCredentials(userUpdateSchema),
            authTokenMiddleware.authenticate,
            tryCatch(UserController.update),
        ]);
        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(UserController.remove),
        ]);
    }
}

export default new UserRoutes().router;