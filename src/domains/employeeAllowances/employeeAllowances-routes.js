import BaseRoutes from "../../base_classes/base-routes.js";
import EmployeeallowancesController from "./employeeAllowances-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';

class EmployeeallowancesRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [tryCatch(EmployeeallowancesController.index)]);
        this.router.get("/:id", [tryCatch(EmployeeallowancesController.show)]);
        this.router.post("/", [tryCatch(EmployeeallowancesController.create)]);
        this.router.put("/:id", [tryCatch(EmployeeallowancesController.update)]);
        this.router.delete("/:id", [tryCatch(EmployeeallowancesController.delete)]);
    }
}

export default new EmployeeallowancesRoutes().router;