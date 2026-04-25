import BaseRoutes from "../../base_classes/base-routes.js";
import UserController from "./user-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import {
    userCreateSchema,
    userUpdateSchema,
} from "./user-schema.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import uploadFile from "../../middlewares/upload-file-middleware.js";

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
            authTokenMiddleware.authenticate,
            uploadFile("image").single("profile_uri"),
            validateCredentials(userCreateSchema),
            tryCatch(UserController.create),
        ]);
        this.router.put("/:id", [
            authTokenMiddleware.authenticate,
            uploadFile("image").single("profile_uri"),
            validateCredentials(userUpdateSchema),
            tryCatch(UserController.update),
        ]);
        this.router.delete("/:id", [
            authTokenMiddleware.authenticate,
            tryCatch(UserController.remove),
        ]);
    }
}

export default new UserRoutes().router;