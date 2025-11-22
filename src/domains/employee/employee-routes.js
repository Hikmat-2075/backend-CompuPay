import BaseRoutes from "../../base_classes/base-routes.js";
import EmployeeController from "./employee-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import {
    createEmployeeSchema,
    updateEmployeeSchema,
} from "./employee-schema.js"
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";

class EmployeeRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [
            // authTokenMiddleware.authenticate,
			tryCatch(EmployeeController.list),
		]);
        this.router.get("/:id", [			
            authTokenMiddleware.authenticate,
			tryCatch(EmployeeController.detail),]);
        this.router.post("/", [			
            validateCredentials(createEmployeeSchema),
            authTokenMiddleware.authenticate,
			tryCatch(EmployeeController.create),]);
        this.router.put("/:id", [			
            validateCredentials(updateEmployeeSchema),
            authTokenMiddleware.authenticate,
			tryCatch(EmployeeController.update),]);
        this.router.delete("/:id", [			
            authTokenMiddleware.authenticate,
			tryCatch(EmployeeController.delete),]);
    }
}

export default new EmployeeRoutes().router;