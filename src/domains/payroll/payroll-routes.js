import BaseRoutes from "../../base_classes/base-routes.js";
import PayrollController from "./payroll-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';

class PayrollRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [tryCatch(PayrollController.index)]);
        this.router.get("/:id", [tryCatch(PayrollController.show)]);
        this.router.post("/", [tryCatch(PayrollController.create)]);
        this.router.put("/:id", [tryCatch(PayrollController.update)]);
        this.router.delete("/:id", [tryCatch(PayrollController.delete)]);
    }
}

export default new PayrollRoutes().router;