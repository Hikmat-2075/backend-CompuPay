import BaseRoutes from "../../base_classes/base-routes.js";
import EmployeedeductionsController from "./employeeDeductions-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';

class EmployeedeductionsRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [tryCatch(EmployeedeductionsController.index)]);
        this.router.get("/:id", [tryCatch(EmployeedeductionsController.show)]);
        this.router.post("/", [tryCatch(EmployeedeductionsController.create)]);
        this.router.put("/:id", [tryCatch(EmployeedeductionsController.update)]);
        this.router.delete("/:id", [tryCatch(EmployeedeductionsController.delete)]);
    }
}

export default new EmployeedeductionsRoutes().router;