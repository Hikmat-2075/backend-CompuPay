import BaseRoutes from "../../base_classes/base-routes.js";
import EmployeeController from "./employee-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';

class EmployeeRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [tryCatch(EmployeeController.index)]);
        this.router.get("/:id", [tryCatch(EmployeeController.show)]);
        this.router.post("/", [tryCatch(EmployeeController.create)]);
        this.router.put("/:id", [tryCatch(EmployeeController.update)]);
        this.router.delete("/:id", [tryCatch(EmployeeController.delete)]);
    }
}

export default new EmployeeRoutes().router;